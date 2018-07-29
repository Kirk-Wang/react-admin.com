---
id: actions
title: Writing Actions
---
Admin 界面通常必须提供自定义操作，而不仅仅是简单的 CRUD。 例如, 在管理评论中, "Approve" 按钮 (允许更新 `is_approved` 属性, 并在一次单击中保存更新的记录)-是必须具有的。

如何使用 react-admin 添加这样的自定义动作？ 答案是双重的，react-admin 如何使用 Redux 和 redux-saga，学习并正确的做到这一点会给你更好的理解。

## 简单的方法

这是一个完美的“Approve”按钮的实现：

```jsx
// in src/comments/ApproveButton.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from '@material-ui/core/FlatButton';
import { showNotification as showNotificationAction } from 'react-admin';
import { push as pushAction } from 'react-router-redux';

class ApproveButton extends Component {
    handleClick = () => {
        const { push, record, showNotification } = this.props;
        const updatedRecord = { ...record, is_approved: true };
        fetch(`/comments/${record.id}`, { method: 'PUT', body: updatedRecord })
            .then(() => {
                showNotification('Comment approved');
                push('/comments');
            })
            .catch((e) => {
                console.error(e);
                showNotification('Error: comment not approved', 'warning')
            });
    }

    render() {
        return <FlatButton label="Approve" onClick={this.handleClick} />;
    }
}

ApproveButton.propTypes = {
    push: PropTypes.func,
    record: PropTypes.object,
    showNotification: PropTypes.func,
};

export default connect(null, {
    showNotification: showNotificationAction,
    push: pushAction,
})(ApproveButton);
```

`handleClick` 函数通过 `fetch` 使 `PUT` 请求 REST API，然后显示通知（使用 `showNotification`）并重定向到 comments 列表页面（使用`push`）;

`showNotification` 和 `push` 是 *动作创建者*。 这是返回简单 action 对象的函数的Redux术语。 当在第二个参数中给出一个动作创建者的对象时，`connect()` 将使用 Redux 的`dispatch` 方法装饰[每个动作创建者](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options)，因此在 `handleClick` 函数中，对`showNotification()` 的调用实际上是对 `dispatch(showNotification())` 的调用。

可以立即使用此 `ApproveButton`，例如在注释列表中，其中 `<Datagrid>` 自动将 `record` 注入其子项：

```jsx
// in src/comments/index.js
import ApproveButton from './ApproveButton';

export const CommentList = (props) =>
    <List {...props}>
        <Datagrid>
            <DateField source="created_at" />
            <TextField source="author.name" />
            <TextField source="body" />
            <BooleanField source="is_approved" />
            <ApproveButton />
        </Datagrid>
    </List>;
```

或者，在 `<Edit>` 页面中，作为 [自定义action](./CreateEdit.md#actions)：

```jsx
// in src/comments/CommentEditActions.js
import React from 'react';
import CardActions from '@material-ui/core/CardActions';
import { ListButton, DeleteButton } from 'react-admin';
import ApproveButton from './ApproveButton';

const cardActionStyle = {
    zIndex: 2,
    display: 'inline-block',
    float: 'right',
};

const CommentEditActions = ({ basePath, data, resource }) => (
    <CardActions style={cardActionStyle}>
        <ApproveButton record={data} />
        <ListButton basePath={basePath} />
        <DeleteButton basePath={basePath} record={data} resource={resource} />
    </CardActions>
);

export default CommentEditActions;

// in src/comments/index.js
import CommentEditActions from './CommentEditActions';

export const CommentEdit = (props) =>
    <Edit {...props} actions={<CommentEditActions />}>
        ...
    </Edit>;
```

## 使用 Data Provider 代替 Fetch

前面的代码使用 `fetch()`，这意味着它必须生成原始 HTTP 请求。 REST 逻辑通常需要一些 HTTP 管道来处理查询参数，编码，headers，正文格式等。 事实证明，您可能已经有一个从REST请求映射到HTTP请求的函数：[Data Provider](./DataProviders.md)。 因此，使用此函数而不是 `fetch` 是个好主意 - 前提是您已导出它：

```jsx
// in src/dataProvider.js
import jsonServerProvider from 'ra-data-json-server';
export default jsonServerProvider('http://Mydomain.com/api/');

// in src/comments/ApproveButton.js
import { UPDATE } from 'react-admin';
import dataProvider from '../dataProvider';

class ApproveButton extends Component {
    handleClick = () => {
        const { push, record, showNotification } = this.props;
        const updatedRecord = { ...record, is_approved: true };
        dataProvider(UPDATE, 'comments', { id: record.id, data: updatedRecord })
            .then(() => {
                showNotification('Comment approved');
                push('/comments');
            })
            .catch((e) => {
                console.error(e);
                showNotification('Error: comment not approved', 'warning')
            });
    }

    render() {
        return <FlatButton label="Approve" onClick={this.handleClick} />;
    }
}
```

这下你会懂了：不再 `fetch`。就如 `fetch`，`dataProvider` 返回一个 `Promise`。它的签名是：

```jsx
/**
 * Query a data provider and return a promise for a response
 *
 * @example
 * dataProvider(GET_ONE, 'posts', { id: 123 })
 *  => new Promise(resolve => resolve({ id: 123, title: "hello, world" }))
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the action type
 * @returns {Promise} the Promise for a response
 */
const dataProvider = (type, resource, params) => new Promise();
```

至于各种请求类型的语法（`GET_LIST`，`GET_ONE`，`UPDATE`等），请转到 [Data Provider文档](./DataProviders.md#request-format) 以获取更多详细信息。

## 使用自定义 Action Creator

在组件内部获取数据很容易。 但是，如果您是Redux用户，则可能需要以更为惯用的方式执行此操作-通过分发 action。 首先，创建自己的 action 创建者以替换对 `dataProvider` 的调用：

```jsx
// in src/comment/commentActions.js
import { UPDATE } from 'react-admin';
export const COMMENT_APPROVE = 'COMMENT_APPROVE';
export const commentApprove = (id, data, basePath) => ({
    type: COMMENT_APPROVE,
    payload: { id, data: { ...data, is_approved: true } },
    meta: { resource: 'comments', fetch: UPDATE },
});
```

这个动作创建者利用了 react-admin 的内置 fetcher，它使用 `fetch` meta 监听动作。 在 dispatch 时，此操作将触发对 `dataProvider的调用（UPDATE，'comments'）`，dispatch 一个 `COMMENT_APPROVE_LOADING` action，然后在收到响应后，dispatch一个 `COMMENT_APPROVE_SUCCESS` 或 `COMMENT_APPROVE_FAILURE`。

若要在组件中使用新的action creator，请 `connect`：

```jsx
// in src/comments/ApproveButton.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { commentApprove as commentApproveAction } from './commentActions';

class ApproveButton extends Component {
    handleClick = () => {
        const { commentApprove, record } = this.props;
        commentApprove(record.id, record);
        // how about push and showNotification?
    }

    render() {
        return <Button onClick={this.handleClick}>Approve</Button>;
    }
}

ApproveButton.propTypes = {
    commentApprove: PropTypes.func,
    record: PropTypes.object,
};

export default connect(null, {
    commentApprove: commentApproveAction,
})(ApproveButton);
```

这很好用：当用户按下 “Approve” 按钮时，API 接收 UPDATE 调用，并批准 comment。 但是不可能再在 `handleClick` 中调用 `push` 或 `showNotification`。 这是因为 `commentApprove()` 会立即返回，无论 API 调用是否成功。 你如何在只有当操作成功时运行一个函数？

## 处理副作用

获取数据称为 *副作用*，因为它调用外部世界，并且是异步的。 通常 actions 可能会产生其他副作用，例如显示通知或将用户重定向到其他页面。 就像 `fetch` 副作用一样，您可以通过在动作元 `meta` 中设置适当的键，以声明方式将 side effects 与 action 相关联。

例如，要在调度 `COMMENT_APPROVE` 动作时显示通知，请添加 `notification` meta：

```diff
// in src/comment/commentActions.js
import { UPDATE } from 'react-admin';
export const COMMENT_APPROVE = 'COMMENT_APPROVE';
export const commentApprove = (id, data, basePath) => ({
    type: COMMENT_APPROVE,
    payload: { id, data: { ...data, is_approved: true } },
    meta: {
        resource: 'comments',
        fetch: UPDATE,
+        notification: {
+            body: 'resources.comments.notification.approved_success',
+            level: 'info',
+        },
+        redirectTo: '/comments',
+        basePath,
    },
});
```

React-admin可以处理以下副作用：

* `notification`: Display a notification. The property value should be an object describing the notification to display. The `body` can be a translation key. `level` can be either `info` or `warning`.
* `redirectTo`: Redirect the user to another page. The property value should be the path to redirect the user to.
* `refresh`: Force a rerender of the current view (equivalent to pressing the Refresh button). Set to true to enable.
* `unselectAll`: Unselect all lines in the current datagrid. Set to true to enable.
* `basePath`: This is not a side effect, but it's used internaly to compute redirection paths. Set it when you have a redirection side effect.

## 成功与失败的Side Effects

在前面的示例中，当调度 `COMMENT_APPROVE` action 时，即在甚至调用服务器 *之前*，会出现 "notification approved" 通知。 这有点太早：如果服务器返回错误怎么办？

在实践中，大多数副作用必须在 `fetch` 副作用成功或失败后触发。 为了支持这一点，您可以在动作的 `meta` 属性中的 onSuccess 和 onFailure 键下包含副作用：

```diff
// in src/comment/commentActions.js
import { UPDATE } from 'react-admin';
export const COMMENT_APPROVE = 'COMMENT_APPROVE';
export const commentApprove = (id, data, basePath) => ({
    type: COMMENT_APPROVE,
    payload: { id, data: { ...data, is_approved: true } },
    meta: {
        resource: 'comments',
        fetch: UPDATE,
-        notification: {
-            body: 'resources.comments.notification.approved_success',
-            level: 'info',
-        },
-        redirectTo: '/comments',
-        basePath,
+        onSuccess: {
+            notification: {
+                body: 'resources.comments.notification.approved_success',
+                level: 'info',
+            },
+            redirectTo: '/comments',
+            basePath,
+        },
+        onFailure: {
+            notification: {
+                body: 'resources.comments.notification.approved_failure',
+                level: 'warning',
+            },
+        },
    },
});
```

在这种情况下，调度` COMMENT_APPROVE ` action 时不会触发任何副作用。 但是，当 `fetch` 副作用成功返回时，react-admin 将 dispatch `COMMENT_APPROVE_SUCCESS` action，并将 `onSuccess` 副作用复制到 `meta` 属性中。 所以它会发出一个看起来像这样的 action：

```js
{
    type: COMMENT_APPROVE_SUCCESS,
    payload: { data: { /* data returned by the server */ } },
    meta: {
        resource: 'comments',
        notification: {
            body: 'resources.comments.notification.approved_success',
            level: 'info',
        },
        redirectTo: '/comments',
        basePath,
    },
}
```

然后，副作用将触发。 使用此代码，批准审核现在会显示正确的通知，并重定向到评论列表。

您可以在自己的 action 中使用 `onSuccess` 和 `onFailure` metas来处理副作用。

## 自定义 saga

有时，您可能想要触发其他*副作用*。 React-admin 提升了一种编程风格，其中副作用与代码的其余部分分离，这有利于使它们可测试。

在react-admin中，副作用由 Saga 处理。 [Redux-saga](https://redux-saga.github.io/redux-saga/) 是为 Redux 构建的副作用库，其副作用由生成器函数定义。 如果这对您来说是新手，请花几分钟时间浏览Saga文档。

这是处理失败的 `COMMENT_APPROVE` action的副作用所必需的生成器函数，该操作将使用 [Sentry](https://sentry.io) 等外部服务记录错误：

```jsx
// in src/comments/commentSaga.js
import { call, takeEvery } from 'redux-saga/effects';

function* commentApproveFailure({ error }) {
    yield call(Raven.captureException, error);
}

export default function* commentSaga() {
    yield takeEvery('COMMENT_APPROVE_FAILURE', commentApproveFailure);
}
```

让我们解释所有这些，从最后的 `commentSaga` 生成器函数开始。 [generator function](http://exploringjs.com/es6/ch_generators.html)（由函数名中的`*`表示）在 `yield` 调用的语句上暂停 - 直到 yielding 语句返回。 `yield takeEvery([ACTION_NAME], callback)` executes the provided callback [every time the related action is called](https://redux-saga.github.io/redux-saga/docs/basics/UsingSagaHelpers.html). To summarize, this will execute `commentApproveFailure` when the fetch initiated by `commentApprove()` fails.

As for `commentApproveFailure`, it just dispatch a [`call`](https://redux-saga.js.org/docs/api/#callfn-args) side effect to the `captureException` function from the global `Raven` object.

To use this saga, pass it in the `customSagas` props of the `<Admin>` component:

```jsx
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';

import { CommentList } from './comments';
import commentSaga from './comments/commentSaga';

const App = () => (
    <Admin customSagas={[ commentSaga ]} dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
        <Resource name="comments" list={CommentList} />
    </Admin>
);

export default App;
```

With this code, a failed review approval now sends the the correct signal to Sentry.

**Tip**: The side effects are [testable](https://redux-saga.github.io/redux-saga/docs/introduction/BeginnerTutorial.html#making-our-code-testable), too.

## Optimistic Rendering and Undo

In the previous example, after clicking on the "Approve" button, a spinner displays while the data provider is fetched. Then, users are redirected to the comments list. But in most cases, the server returns a success response, so the user waits for this response for nothing.

For its own fetch actions, react-admin uses an approach called *optimistic rendering*. The idea is to handle the `fetch` actions on the client side first (i.e. updating entities in the Redux store), and re-render the screen immediately. The user sees the effect of their action with no delay. Then, react-admin applies the success side effects, and only after that it triggers the fetch to the data provider. If the fetch ends with a success, react-admin does nothing more than a refresh to grab the latest data from the server, but in most cases, the user sees no difference (the data in the Redux store and the data from the data provider are the same). If the fetch fails, react-admin shows an error notification, and forces a refresh, too.

As a bonus, while the success notification is displayed, users have the ability to cancel the action *before* the data provider is even called.

To make an action with a `fetch` meta optimistic, decorate it with the `startUndoable` action creator:

```diff
// in src/comments/ApproveButton.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
+ import { startUndoable as startUndoableAction } from 'ra-core';
- import { commentApprove as commentApproveAction } from './commentActions';
+ import { commentApprove } from './commentActions';

class ApproveButton extends Component {
    handleClick = () => {
-        const { commentApprove, record } = this.props;
-        commentApprove(record.id, record);
+        const { startUndoable, record } = this.props;
+        startUndoable(commentApprove(record.id, record));
    }

    render() {
        return <Button onClick={this.handleClick}>Approve</Button>;
    }
}

ApproveButton.propTypes = {
-    commentApprove: PropTypes.func,
+    startUndoable: PropTypes.func,
    record: PropTypes.object,
};

export default connect(null, {
-    commentApprove: commentApproveAction,
+    startUndoable: startUndoableAction,
})(ApproveButton);
```

And that's all it takes to make a fetch action optimistic. Note that the `startUndoable` action creator is passed to Redux `connect` as `mapDispatchToProp`, to be decorated with `dispatch` - but `commentApprove` is not. Only the first action must be decorated with dispatch.

The fact that react-admin updates the internal store if you use custom actions with the `fetch` meta should be another motivation to avoid using raw `fetch`.

## Using a Custom Reducer

In addition to triggering REST calls, you may want to store the effect of your own actions in the application state. For instance, if you want to display a widget showing the current exchange rate for the bitcoin, you might need the following action:

```jsx
// in src/bitcoinRateReceived.js
export const BITCOIN_RATE_RECEIVED = 'BITCOIN_RATE_RECEIVED';
export const bitcoinRateReceived = (rate) => ({
    type: BITCOIN_RATE_RECEIVED,
    payload: { rate },
});
```

This action can be triggered on mount by the following component:

```jsx
// in src/BitCoinRate.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bitcoinRateReceived as bitcoinRateReceivedAction } from './bitcoinRateReceived';

class BitCoinRate extends Component {
    componentWillMount() {
        fetch('https://blockchain.info/fr/ticker')
            .then(response => response.json())
            .then(rates => rates.USD['15m'])
            .then(bitcoinRateReceived) // dispatch action when the response is received
    }

    render() {
        const { rate } = this.props;
        return <div>Current bitcoin value: {rate}$</div>
    }
}

BitCoinRate.propTypes = {
    bitcoinRateReceived: PropTypes.func,
    rate: PropTypes.number,
};

const mapStateToProps = state => ({ rate: state.bitcoinRate });

export default connect(mapStateToProps, {
    bitcoinRateReceived: bitcoinRateReceivedAction,
})(BitCoinRate);
```

In order to put the rate passed to `bitcoinRateReceived()` into the Redux store, you'll need a reducer:

```jsx
// in src/rateReducer.js
import { BITCOIN_RATE_RECEIVED } from './bitcoinRateReceived';

export default (previousState = 0, { type, payload }) => {
    if (type === BITCOIN_RATE_RECEIVED) {
        return payload.rate;
    }
    return previousState;
}
```

Now the question is: How can you put this reducer in the `<Admin>` app? Simple: use the `customReducers` props:

```jsx
// in src/App.js
import React from 'react';
import { Admin } from 'react-admin';

import rate from './rateReducer';

const App = () => (
    <Admin customReducers={{ rate }} dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
        ...
    </Admin>
);

export default App;
```

**Tip**: You can avoid storing data in the Redux state by storing data in a component state instead. It's much less complicated to deal with, and more performant, too. Use the global state only when you really need to.

## List Bulk Actions

Almost everything we saw before is true for custom `List` bulk actions too, with the following few differences:

* They receive the following props: `resource`, `selectedIds` and `filterValues`
* They do not receive the current record in the `record` prop as there are many of them.
* They must render as a material-ui [`MenuItem`](http://www.material-ui.com/#/components/menu).

You can find a complete example in the `List` documentation, in the [`bulk-actions`](/List.html#bulk-actions) section.

## Conclusion

Which style should you choose for your own action buttons?

The first version (with `fetch`) is perfectly fine, and if you're not into unit testing your components, or decoupling side effects from pure functions, then you can stick with it without problem.

On the other hand, if you want to promote reusability, separation of concerns, adhere to react-admin's coding standards, and if you know enough Redux and Saga, use the final version.