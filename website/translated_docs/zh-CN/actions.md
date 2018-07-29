---
id: actions
title: 编写 Action
---
Admin 界面通常必须提供自定义操作，而不仅仅是简单的 CRUD。 例如, 在管理评论中, "Approve" 按钮 (允许更新` is_approved` 属性, 并在一次单击中保存更新的记录)-是必须具有的。

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

让我们解释所有这些，从最后的 `commentSaga` 生成器函数开始。 [generator function](http://exploringjs.com/es6/ch_generators.html)（由函数名中的`*`表示）在 `yield` 调用的语句上暂停 - 直到 yielding 语句返回。 `yield takeEvery([ACTION_NAME], callback)` [每次调用相关 action 时](https://redux-saga.github.io/redux-saga/docs/basics/UsingSagaHelpers.html)都会执行提供的回调。 总而言之，当 `commentApprove()` 初始 fetch 失败时，这将执行commentApproveFailure。

对于 `commentApproveFailure`，它只是从全局 `Raven` 对象向`captureException` 函数 dispatch 一个 [`call `](https://redux-saga.js.org/docs/api/#callfn-args) 副作用。

要使用此 saga，请将其传递到 `<Admin>` 组件的 `customSagas` 属性中：

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

使用此代码，失败的审核批准现在会向 Sentry 发送正确的信号。

**提示**：副作用也是[可测试的](https://redux-saga.github.io/redux-saga/docs/introduction/BeginnerTutorial.html#making-our-code-testable)。

## 积极的渲染和撤消

在前面的示例中，单击“Approve”按钮后，将在 fetch data provider 时显示 spinner。 然后，用户被重定向到评论列表。 但在大多数情况下，服务器会返回成功响应，因此用户无需等待此响应。

对于自己的 fetch actions，react-admin 使用称为 *积极渲染* 的方法。 想法是首先处理客户端上的 `fetch` actions（即更新 Redux store 的实体），并立即重新渲染屏幕。 用户可以毫不拖延地看到他们 action 的效果。 然后，react-admin 应用 success side effects, 并且仅在此之后它触发对 data provider 的 fetch。 如果 fetch 成功结束，react-admin 只会刷新以从服务器获取最新数据，但在大多数情况下，用户看不到任何差异（Redux store 中的数据和来自 data provider 的数据） 是相同的）。 如果提取失败，react-admin 会显示错误通知，并强制刷新。

作为奖励，当显示成功通知时，用户可以在甚至调用 data provide *之前* 取消 action。

要使用` fetch ` meta optimistic 进行操作，请使用` startUndoable ` action 创建器进行装饰：

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

这就是使 fetch action 变得积极所需的全部内容。 请注意，`startUndoable` action 创建者将作为 `mapDispatchToProp` 传递给Redux `connect`，以便使用 `dispatch` 进行修饰 - 但是`commentApprove`不是。 只有第一个 action 必须用 dispatch 装饰。

如果您对` fetch ` meta 使用自定义 action，react-admin 更新内部 store 的事应该是避免使用原始 `fetch` 的另一个动机。

## 使用自定义 Reducer

除了触发REST调用之外，您可能希望将自己的操作的效果存储在应用程序状态。 例如，如果要显示一个显示比特币当前汇率的小部件，可能需要执行以下操作：

```jsx
// in src/bitcoinRateReceived.js
export const BITCOIN_RATE_RECEIVED = 'BITCOIN_RATE_RECEIVED';
export const bitcoinRateReceived = (rate) => ({
    type: BITCOIN_RATE_RECEIVED,
    payload: { rate },
});
```

可以通过以下组件在挂载时触发此动作：

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

为了将汇率传递到 `bitcoinRateReceived()` 进入 Redux store 里，你需要一个reducer：

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

现在的问题是：你如何把这个 reducer 放在 `<Admin>` 应用程序中？ 简单：使用 `customReducers` 属性：

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

**提示**: 您可以避免将数据存储在 Redux 状态中，而是将数据存储在组件状态中。 处理起来要复杂得多，而且性能也要高一些。 只有在真正需要时才使用全局状态。

## List Bulk Actions

我们之前看到的几乎所有内容都适用于自定义 `List` 批量操作，但有以下几点不同：

* 他们收到以下属性：`resource`，`selectedIds` 和 `filterValues`
* 它们没有收到` record ` 属性中的当前记录，因为它们中有很多。
* 它们必须呈现为 material-ui [`MenuItem`](http://www.material-ui.com/#/components/menu)。

您可以在 [`批量操作`](/List.html#bulk-actions) 部分的 `
List` 文档中找到完整的示例。

## 结论

您应该为自己的操作按钮选择哪种样式？

第一个版本（带 `fetch`）是非常好的，如果您不必单元测试您的组件，或者从纯功能中解除副作用，那么您可以坚持使用它。

另一方面，如果您想提高可重用性，关注点分离，遵守 react-admin 的编码标准，并且如果您对Redux 和 Saga 有足够的了解，请使用最终版本。