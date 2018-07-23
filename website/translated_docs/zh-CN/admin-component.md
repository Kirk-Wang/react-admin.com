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

要注册自己的路由, 请创建一个模块, 返回一个 [react-router](https://github.com/ReactTraining/react-router) `<Route>` 组件列表：

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

然后，将此数组作为 `customRoutes` 属性传递到 `<Admin>` 组件中：

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

现在，当用户浏览`/foo`或`/bar`时，您定义的组件将显示在屏幕的主要部分中。 当用户浏览 `/baz` 时，组件将出现在定义的布局之外，让您可以自由地按照自己的方式设计。

**提示**：您可以创建[自定义菜单](#menu)入口或自定义按钮来引导您的自定义页面。

**提示**：自定义页面优先于 react-admin 自己的路由。 这意味着 `customRoutes` 允许您覆盖所需的任何路由！ 如果你要在所有 react-admin *之后*添加路由，请使用 [`catchAll` 属性](#catchall)代替。

**提示**：要看起来像其他 react-admin 页面，您的自定义页应具有以下结构:

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

`authProvider` 属性期望函数返回一个Promise，以控制应用程序身份验证策略：

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

[身份验证文档](./Authentication.html) 解释如何详细实现这些功能。

## `loginPage`

如果要自定义登录页，或切换到其他身份验证策略，而不是用户名/密码表单, 请将自己的组件作为 `loginPage` 属性传递。 只要调用 `/login` 路由，React-admin 就会显示该组件。

```jsx
import MyLoginPage from './MyLoginPage';

const App = () => (
    <Admin loginPage={MyLoginPage}>
        ...
    </Admin>
);
```

有关详细信息, 请参阅 [身份验证文档](./Authentication.html#customizing-the-login-and-logout-components)。

## `logoutButton`

如果自定义 `loginPage`，则可能需要重写 `logoutButton`，因为它们共享身份验证策略。

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

`initialState` 属性允许您将预加载状态传递给Redux。 有关详细信息, 请参阅 [Redux文档](http://redux.js.org/docs/api/createStore.html#createstorereducer-preloadedstate-enhancer)。

## `history`

默认情况下, react-admin 使用哈希符号 (例如"myadmin.acme.com/#/posts/123") 创建 url。 URL 的哈希部分 (即 示例中的 `#/posts/123` 包含主应用程序路由。 此策略具有在没有服务器和旧式 web 浏览器的情况下工作的好处。 但您可能希望使用其他路由策略, 例如, 允许服务器端渲染。

您可以创建自己的 `history` 函数 (与 [ `history` npm包兼容](https://github.com/reacttraining/history))。并将其传递到 `<Admin>` 组件以覆盖默认历史记录策略。 例如，要使用 `browserHistory`：

```js
import createHistory from 'history/createBrowserHistory';

const history = createHistory();

const App = () => (
    <Admin history={history}>
        ...
    </Admin>
);
```

## 国际化 （in）

`locale` 和 `messages` 属性允许您翻译GUI。翻译文档详细介绍了此过程。

## 在运行时声明资源

您可能希望在应用启动时动态定义Resource。 `<Admin>` 组件接受一个函数作为其子函数，此函数可以返回一个Promise。 如果还定义了 `authProvider`, 则该函数将接收到 `authProvider` 的调用结果, 并使用 `AUTH_GET_PERMISSIONS` 类型 (您可以在 [授权](./Authorization.html) 章节中阅读更多信息)。

例如, 从 API 获取资源可能类似于：

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