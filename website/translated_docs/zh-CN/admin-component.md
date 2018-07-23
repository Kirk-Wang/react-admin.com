---
id: admin-component
title: <Admin>
---
`<Admin>` 组件创建一个具有自己的状态、路由和控制器逻辑的应用程序。 `<Admin>` 只需要一个 `dataProvider` 属性, 并且至少有一个子 `<Resource>` 就能工作：

```jsx
// in src/App.js
import React from 'react';

import { Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

import { PostList } from './posts';

const App = () => (
    <Admin dataProvider={simpleRestProvider('http://path.to.my.api')}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

以下是通过该组件接受的所有属性：

* [`dataProvider`](#dataprovider)
* [`title`](#title)
* [`dashboard`](#dashboard)
* [`catchAll`](#catchall)
* [`menu`](#menu) (deprecated)
* [`theme`](#theme)
* [`appLayout`](#applayout)
* [`customReducers`](#customreducers)
* [`customSagas`](#customsagas)
* [`customRoutes`](#customroutes)
* [`authProvider`](#authprovider)
* [`loginPage`](#loginpage)
* [`logoutButton`](#logoutbutton)
* [`locale`](#internationalization)
* [`messages`](#internationalization)
* [`initialState`](#initialstate)
* [`history`](#history)

## `dataProvider`

唯一必需的属性，它必须是一个返回一个promise的函数，具有下列签名：

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

`dataProvider` 也是添加自定义 HTTP 头、身份验证等的理想位置。 [Data Providers 章节](./DataProviders.html) 文档列出了可用的Data Provider，以及如何构建自己的 Data Provider 客户端。

## `title`

默认情况下，一个admin app的头部使用'React Admin'作为主app标题。它可能是你会想要自定义的第一件事。这个`title`属性正是为这个目的服务的。

```jsx
const App = () => (
    <Admin title="My Custom Admin" dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

## `dashboard`

默认情况下，一个admin app的主页是第一个子`<Resource>`的`list`。 但你也可以指定一个自定义组件代替。 要适应一般设计，请使用Material UI `<Card>`组件和 react-admin `<ViewTitle>`组件：

```jsx
// in src/Dashboard.js
import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { ViewTitle } from 'react-admin';
export default () => (
    <Card>
        <ViewTitle title="Welcome to the administration" />
        <CardContent>Lorem ipsum sic dolor amet...</CardContent>
    </Card>
);
```

```jsx
// in src/App.js
import Dashboard from './Dashboard';

const App = () => (
    <Admin dashboard={Dashboard} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

![Custom home page](https://marmelab.com/react-admin/img/dashboard.png)

**提示**：添加 `<ViewTitle>` 组件还将允许标题以移动分辨率显示。

## `catchAll`

当用户键入的 url 与任何子 `<Resource>` 组件不匹配时, 它们会看到默认的 "Not Found" 页。

![Not Found](https://marmelab.com/react-admin/img/not-found.png)

您可以自定义此页以使用您选择的组件, 将其作为 `catchAll` 属性传递。 要适应一般设计，请使用Material UI `<Card>`组件和 react-admin `<ViewTitle>`组件：

```jsx
// in src/NotFound.js
import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { ViewTitle } from 'react-admin';

export default () => (
    <Card>
        <ViewTitle title="Not Found" />
        <CardContent>
            <h1>404: Page not found</h1>
        </CardContent>
    </Card>
);
```

```jsx
// in src/App.js
import NotFound from './NotFound';

const App = () => (
    <Admin catchAll={NotFound} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

**提示**：如果您的自定义 `catchAll` 组件包含 react-router `<Route>` 组件，则允许您轻松注册 react-admin 布局中显示的新路由。 请注意，在测试了所有 react-admin 资源路由*后*，这些路由将匹配。 要在 react-admin *之前*添加自定义路由，并因此覆盖默认资源路由，请改用[customRoutes</code> 属性](#customroutes)。

## `menu`

**提示**：这个属性被废弃了。要覆盖菜单组件，请使用自定义布局。

React-admin使用作为 `<Admin>` 子级传递的 `<Resource>` 组件列表，使用列表组件为每个资源构建菜单。

如果你想要添加或删除菜单项，例如要链接到非资源页面，你可以创建你自己的菜单组件：

```jsx
// in src/Menu.js
import React, { createElement } from 'react';
import { connect } from 'react-redux';
import { MenuItemLink, getResources } from 'react-admin';
import { withRouter } from 'react-router-dom';
import LabelIcon from '@material-ui/icons/Label';

import Responsive from '../layout/Responsive';

const Menu = ({ resources, onMenuClick, logout }) => (
    <div>
        {resources.map(resource => (
            <MenuItemLink 
                to={`/${resource.name}`}
                primaryText={resource.name}
                leftIcon={createElement(resource.icon)}
                onClick={onMenuClick}
            />
        ))}
        <MenuItemLink 
            to="/custom-route"
            primaryText="Miscellaneous"
            leftIcon={<LabelIcon />}
            onClick={onMenuClick} />
        <Responsive
            small={logout}
            medium={null} // Pass null to render nothing on larger devices
        />
    </div>
);

const mapStateToProps = state => ({
    resources: getResources(state),
});

export default withRouter(connect(mapStateToProps)(Menu));
```

**提示**: 注意 `MenuItemLink` 组件。 必须使用它来避免移动视图中的不必要的副作用。 它支持自定义文本和图标 (必须是 material-ui 的 `<SvgIcon>`)。

**提示**：注意, 我们只在小设备上包含 ` logout ` 项目。实际上, ` logout ` 按钮已显示在较大设备的 AppBar 中。

**提示**: 注意, 我们使用React Router [`withRouter`](https://reacttraining.com/react-router/web/api/withRouter) 高阶组件和使用 **之前** Redux[ connect ](https://github.com/reactjs/react-redux/blob/master/docs/api.html#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options)。 如果要突出显示活动菜单项，则需要此选项。

然后, 将其传递到 `<Admin>` 组件, 作为 `menu` 属性：

```jsx
// in src/App.js
import Menu from './Menu';

const App = () => (
    <Admin menu={Menu} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

有关详细信息, 请参阅 [主题文档](./Theming.html#using-a-custom-menu)。

## `theme`

Material UI 支持 [主题](http://www.material-ui.com/#/customization/themes)。 这使您可以通过覆盖字体、颜色和间距来自定义 admin 的外观。 您可以使用 `theme` 属性提供自定义 material ui 主题:

```jsx
import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    type: 'dark', // Switching the dark mode on is a single property value change.
  },
});

const App = () => (
    <Admin theme={theme} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

![Dark theme](https://marmelab.com/react-admin/img/dark-theme.png)

有关预定义主题和自定义主题的详细信息, 请参阅 [Material UI 自定义文档](https://material-ui.com/customization/themes/)。

## `appLayout`

如果要深度自定义应用程序头、菜单或通知, 最好的方法是提供自定义布局组件。 它必须包含 `{children}` 占位符, 其中就是 react-admin 将渲染的资源。 如果使用material UI fields 和 inputs, 则应包含 `<MuiThemeProvider>` 元素。 最后, 如果您希望当应用程序在后台获取数据时，在 app header中显示spinner，则 Layout 应 connect 到redux store。

使用 [默认布局](https://github.com/marmelab/react-admin/blob/master/packages/ra-ui-materialui/src/layout/Layout.js) 作为起始点, 并查看 [主题文档](./Theming.html#using-a-custom-layout) 示例。

```jsx
// in src/App.js
import MyLayout from './MyLayout';

const App = () => (
    <Admin appLayout={MyLayout} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

如果只想覆盖 appBar、菜单或通知组件, 则自定义布局可以简单地扩展默认的 `<Layout>` 组件。例如：

```jsx
// in src/MyLayout.js
import { Layout } from 'react-admin';
import MyAppBar from './MyAppBar';
import MyMenu from './MyMenu';
import MyNotification from './MyNotification';

const MyLayout = (props) => <Layout 
    {...props}
    appBar={MyAppBar}
    menu={MyMenu}
    notification={MyNotification}
/>;

export default MyLayout;
```

有关自定义布局的详细信息，请查看 [主题文档](./Theming.html#using-a-custom-layout)。

## `customReducers`

`<Admin>` app 使用 [Redux](http://redux.js.org/) 来管理状态。状态具有以下键：

```jsx
{
    admin: { /*...*/ }, // used by react-admin
    form: { /*...*/ }, // used by redux-form
    routing: { /*...*/ }, // used by react-router-redux
}
```

如果你的组件 dispatch 自定义 action，则可能需要注册你自己的 reducer 以使用这些 action 更新状态。 让我们假设您希望将比特币汇率保持在状态中的 `bitcoinRate` 键中。 你可能有一个如下所示的 reducer：

```jsx
// in src/bitcoinRateReducer.js
export default (previousState = 0, { type, payload }) => {
    if (type === 'BITCOIN_RATE_RECEIVED') {
        return payload.rate;
    }
    return previousState;
}
```

要在`<Admin>`应用程序中注册此reducer，只需将其传递给`customReducers` 属性：

{% raw %}

```jsx
// in src/App.js
import React from 'react';
import { Admin } from 'react-admin';

import bitcoinRateReducer from './bitcoinRateReducer';

const App = () => (
    <Admin customReducers={{ bitcoinRate: bitcoinRateReducer }} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        ...
    </Admin>
);

export default App;
```

{% endraw %}

现在 state 将看起来像：

```jsx
{
    admin: { /*...*/ }, // used by react-admin
    form: { /*...*/ }, // used by redux-form
    routing: { /*...*/ }, // used by react-router-redux
    bitcoinRate: 123, // managed by rateReducer
}
```

## `customSagas`

`<Admin>` app 使用 redux-saga 来处理副作用（AJAX调用，通知，重定向等）。

如果你的组件 dispatch 自定义 action，则可能需要注册你自己的 side effedcts 作为 saga。 假设您希望在dispatch `BITCOIN_RATE_RECEIVED` action 时显示通知。 你可能有一个类似如下的saga：

```jsx
// in src/bitcoinSaga.js
import { put, takeEvery } from 'redux-saga/effects';
import { showNotification } from 'react-admin';

export default function* bitcoinSaga() {
    yield takeEvery('BITCOIN_RATE_RECEIVED', function* () {
        yield put(showNotification('Bitcoin rate updated'));
    })
}
```

要在 `<Admin>` app 中注册此 saga, 只需在 `customSagas` 属性中传递它：

```jsx
// in src/App.js
import React from 'react';
import { Admin } from 'react-admin';

import bitcoinSaga from './bitcoinSaga';

const App = () => (
    <Admin customSagas={[ bitcoinSaga ]} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        ...
    </Admin>
);

export default App;
```

## `customRoutes`

To register your own routes, create a module returning a list of [react-router](https://github.com/ReactTraining/react-router) `<Route>` component:

```jsx
// in src/customRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';
import Foo from './Foo';
import Bar from './Bar';
import Baz from './Baz';

export default [
    <Route exact path="/foo" component={Foo} />,
    <Route exact path="/bar" component={Bar} />,
    <Route exact path="/baz" component={Baz} noLayout />,
];
```

Then, pass this array as `customRoutes` prop in the `<Admin>` component:

```jsx
// in src/App.js
import React from 'react';
import { Admin } from 'react-admin';

import customRoutes from './customRoutes';

const App = () => (
    <Admin customRoutes={customRoutes} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        ...
    </Admin>
);

export default App;
```

Now, when a user browses to `/foo` or `/bar`, the components you defined will appear in the main part of the screen. When a user browses to `/baz`, the component will appear outside of the defined Layout, leaving you the freedom to design the screen the way you want.

**Tip**: It's up to you to create a [custom menu](#menu) entry, or custom buttons, to lead to your custom pages.

**Tip**: Your custom pages take precedence over react-admin's own routes. That means that `customRoutes` lets you override any route you want! If you want to add routes *after* all the react-admin routes, use the [`catchAll` prop](#catchall) instead.

**Tip**: To look like other react-admin pages, your custom pages should have the following structure:

```jsx
// in src/Foo.js
import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { ViewTitle } from 'react-admin';

const Foo = () => (
    <Card>
        <ViewTitle title="My Page" />
        <CardContent>
            ...
        </CardContent>
    </Card>
));

export default Foo;
```

## `authProvider`

The `authProvider` prop expect a function returning a Promise, to control the application authentication strategy:

```jsx
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'react-admin';

const authProvider(type, params) {
    // type can be any of AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, and AUTH_CHECK
    // ...
    return Promise.resolve();
};

const App = () => (
    <Admin authProvider={authProvider} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        ...
    </Admin>
);
```

The [Authentication documentation](./Authentication.html) explains how to implement these functions in detail.

## `loginPage`

If you want to customize the Login page, or switch to another authentication strategy than a username/password form, pass a component of your own as the `loginPage` prop. React-admin will display this component whenever the `/login` route is called.

```jsx
import MyLoginPage from './MyLoginPage';

const App = () => (
    <Admin loginPage={MyLoginPage}>
        ...
    </Admin>
);
```

See The [Authentication documentation](./Authentication.html#customizing-the-login-and-logout-components) for more details.

## `logoutButton`

If you customize the `loginPage`, you probably need to override the `logoutButton`, too - because they share the authentication strategy.

```jsx
import MyLoginPage from './MyLoginPage';
import MyLogoutButton from './MyLogoutButton';

const App = () => (
    <Admin loginPage={MyLoginPage} logoutButton={MyLogoutButton}>
        ...
    </Admin>
);
```

## `initialState`

The `initialState` prop lets you pass preloaded state to Redux. See the [Redux Documentation](http://redux.js.org/docs/api/createStore.html#createstorereducer-preloadedstate-enhancer) for more details.

## `history`

By default, react-admin creates URLs using a hash sign (e.g. "myadmin.acme.com/#/posts/123"). The hash portion of the URL (i.e. `#/posts/123` in the example) contains the main application route. This strategy has the benefit of working without a server, and with legacy web browsers. But you may want to use another routing strategy, e.g. to allow server-side rendering.

You can create your own `history` function (compatible with [the `history` npm package](https://github.com/reacttraining/history)), and pass it to the `<Admin>` component to override the default history strategy. For instance, to use `browserHistory`:

```js
import createHistory from 'history/createBrowserHistory';

const history = createHistory();

const App = () => (
    <Admin history={history}>
        ...
    </Admin>
);
```

## Internationalization

The `locale` and `messages` props let you translate the GUI. The [Translation Documentation](./Translation.html) details this process.

## Declaring resources at runtime

You might want to dynamically define the resources when the app starts. The `<Admin>` component accepts a function as its child and this function can return a Promise. If you also defined an `authProvider`, the function will receive the result of a call to `authProvider` with the `AUTH_GET_PERMISSIONS` type (you can read more about this in the [Authorization](./Authorization.html) chapter).

For instance, getting the resource from an API might look like:

```js
import React from 'react';

import { Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

import { PostList } from './posts';
import { CommentList } from './comments';

const knownResources = [
    <Resource name="posts" list={PostList} />,
    <Resource name="comments" list={CommentList} />,
];

const fetchResources = permissions =>
    fetch('https://myapi/resources', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(permissions),
    })
    .then(response => response.json())
    .then(json => knownResources.filter(resource => json.resources.includes(resource.props.name)));

const App = () => (
    <Admin dataProvider={simpleRestProvider('http://path.to.my.api')}>
        {fetchResources}
    </Admin>
);
```

## Using react-admin without `<Admin>` and `<Resource>`

Using `<Admin>` and `<Resource>` is completely optional. If you feel like bootstrapping a redux app yourself, it's totally possible. Head to [Including in another app](./CustomApp.html) for a detailed how-to.