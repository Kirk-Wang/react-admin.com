---
id: authentication
title: Authentication
---
![Logout button](https://marmelab.com/react-admin/img/login.gif)

React-admin 可以通过您选择的身份验证策略来保护您的admin app。 由于有许多不同的可能策略（Basic Auth，JWT，OAuth等），react-admin 只需提供钩子来执行您自己的验证代码。

默认情况下，react-admin 应用程序不需要身份验证。 但是，如果REST API返回401（Unauthorized）或403（Forbidden）响应，则用户将被重定向到 `/login` 路由。 你啥事都不需要做 - 它已经内置了。

## 配置 Auth Provider

默认情况下，`/login` 路由呈现一个名为 `Login` 的特殊组件，它显示一个要求输入用户名和密码的登录表单。

![Default Login Form](https://marmelab.com/react-admin/img/login-form.png)

这种表单在提交时取决于 `<Admin>` 组件的 `authProvider`属性。 此函数接收认证请求 `type，params`，并返回一个 Promise。 `Login` 使用 `AUTH_LOGIN` 类型调用 `authProvider`，并使用 `{login，password}` 作为参数。 它是验证用户身份和存储凭据的理想场所。

例如，要通过HTTPS查询身份验证路由并将凭据（令牌）存储在本地存储中，请按如下方式配置`authProvider`：

```jsx
// in src/authProvider.js
import { AUTH_LOGIN } from 'react-admin';

export default (type, params) => {
    if (type === AUTH_LOGIN) {
        const { username, password } = params;
        const request = new Request('https://mydomain.com/authenticate', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        })
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(({ token }) => {
                localStorage.setItem('token', token);
            });
    }
    return Promise.resolve();
}
```

**提示**：在 `localStorage`中存储凭据是一个好主意，以便在打开新的浏览器选项卡时避免重新连接。 但这会使您的应用程序 [对XSS攻击开放](http://www.redotheweb.com/2015/11/09/api-security.html)，因此您最好在安全性方面加倍，并在服务器端添加一个`httpOnly` cookie。

然后, 将此客户端传递到 `<Admin>` 组件：

```jsx
// in src/App.js
import authProvider from './authProvider';

const App = () => (
    <Admin authProvider={authProvider}>
        ...
    </Admin>
);
```

当收到403响应时, admin app显示登录页。 `authProvider` 现在在用户提交登录表单时被调用。 一旦 promise resolve ，登录表单重定向到上一页，或者如果用户刚刚到达，则重定向到 admin index。

## 向 API 发送凭据

要在调用数据提供程序时使用凭据，您必须进行调整，这一次是`dataProvider` 函数。 如 [ Data Provider 文档](DataProviders.md#adding-custom-headers)中所述, `simpleRestProvider` 和 `jsonServerProvider` 以 `httpClient` 作为第二个参数。 这是您可以更改请求头、cookie 等的位置。

例如，要将登录期间获得的令牌传递为 `Authorization` header，请按如下方式配置Data Provider：

```jsx
import { fetchUtils, Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('token');
    options.headers.set('Authorization', `Bearer ${token}`);
    return fetchUtils.fetchJson(url, options);
}
const dataProvider = simpleRestProvider('http://localhost:3000', httpClient);

const App = () => (
    <Admin dataProvider={dataProvider} authProvider={authProvider}>
        ...
    </Admin>
);
```

如果您有一个自定义 REST client，请不要忘记自己添加凭据。

## 添加 Logout 按钮

如果您提供 `authProvider` 属性到 `<Admin>`，react-admin 显示注销按钮在顶部栏 (或在移动菜单上)。 当用户单击注销按钮时，此操作将使用 `AUTH_LOGOUT` 类型调用 `authProvider`，并删除来自 redux store 的潜在敏感数据。 Resolve 后，用户将被重定向到登录页面。

例如，要在注销时从 local storage 中删除 token：

```jsx
// in src/authProvider.js
import { AUTH_LOGIN, AUTH_LOGOUT } from 'react-admin';

export default (type, params) => {
    if (type === AUTH_LOGIN) {
        // ...
    }
    if (type === AUTH_LOGOUT) {
        localStorage.removeItem('token');
        return Promise.resolve();
    }
    return Promise.resolve();
};
```

![Logout button](https://marmelab.com/react-admin/img/logout.gif)

`authProvider` 也是通知 authentication API 的好地方, 用户凭据在注销后不再有效。

## 捕获 API 上的身份验证错误

即使用户可能在客户端进行身份验证，服务器端其凭据可能不再是有效的（例如，如果令牌仅在几周内有效）。 在这种情况下，API 通常会回答所有 REST 请求具有错误代码 401 或 403 - 但是*你的*API呢？

幸运的是，每次 API 返回一个错误时，`authProvider` 都将使用 `AUTH_ERROR` type 调用。 再次，由您决定哪些 HTTP 状态代码应允许用户继续 (通过返回已解决的 Promise) 或注销 (通过返回拒绝的 Promise)。

例如，401和403代码都要将用户重定向到登录页面：

```jsx
// in src/authProvider.js
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR } from 'react-admin';

export default (type, params) => {
    if (type === AUTH_LOGIN) {
        // ...
    }
    if (type === AUTH_LOGOUT) {
        // ...
    }
    if (type === AUTH_ERROR) {
        const status  = params.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            return Promise.reject();
        }
        return Promise.resolve();
    }
    return Promise.resolve();
};
```

## Checking Credentials During Navigation

Redirecting to the login page whenever a REST response uses a 401 status code is usually not enough, because react-admin keeps data on the client side, and could display stale data while contacting the server - even after the credentials are no longer valid.

Fortunately, each time the user navigates, react-admin calls the `authProvider` with the `AUTH_CHECK` type, so it's the ideal place to check for credentials.

For instance, to check for the existence of the token in local storage:

```jsx
// in src/authProvider.js
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'react-admin';

export default (type, params) => {
    if (type === AUTH_LOGIN) {
        // ...
    }
    if (type === AUTH_LOGOUT) {
        // ...
    }
    if (type === AUTH_ERROR) {
        // ...
    }
    if (type === AUTH_CHECK) {
        return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
    }
    return Promise.reject('Unkown method');
};
```

If the promise is rejected, react-admin redirects by default to the `/login` page. You can override where to redirect the user by passing an argument with a `redirectTo` property to the rejected promise:

```jsx
// in src/authProvider.js
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'react-admin';

export default (type, params) => {
    if (type === AUTH_LOGIN) {
        // ...
    }
    if (type === AUTH_LOGOUT) {
        // ...
    }
    if (type === AUTH_ERROR) {
        // ...
    }
    if (type === AUTH_CHECK) {
        return localStorage.getItem('token') ? Promise.resolve() : Promise.reject({ redirectTo: '/no-access' });
    }
    return Promise.reject('Unkown method');
};
```

**Tip**: For the `AUTH_CHECK` call, the `params` argument contains the `resource` name, so you can implement different checks for different resources:

```jsx
// in src/authProvider.js
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'react-admin';

export default (type, params) => {
    if (type === AUTH_LOGIN) {
        // ...
    }
    if (type === AUTH_LOGOUT) {
        // ...
    }
    if (type === AUTH_ERROR) {
        // ...
    }
    if (type === AUTH_CHECK) {
        const { resource } = params;
        if (resource === 'posts') {
            // check credentials for the posts resource
        }
        if (resource === 'comments') {
            // check credentials for the comments resource
        }
    }
    return Promise.reject('Unkown method');
};
```

**Tip**: The `authProvider` can only be called with `AUTH_LOGIN`, `AUTH_LOGOUT`, `AUTH_ERROR`, or `AUTH_CHECK`; that's why the final return is a rejected promise.

## Customizing The Login and Logout Components

Using `authProvider` and `checkCredentials` is enough to implement a full-featured authorization system if the authentication relies on a username and password.

But what if you want to use an email instead of a username? What if you want to use a Single-Sign-On (SSO) with a third-party authentication service? What if you want to use two-factor authentication?

For all these cases, it's up to you to implement your own `LoginPage` component, which will be displayed under the `/login` route instead of the default username/password form, and your own `LogoutButton` component, which will be displayed in the sidebar. Pass both these components to the `<Admin>` component:

**Tip**: Use the `userLogin` and `userLogout` actions in your custom `Login` and `Logout` components.

```jsx
// in src/MyLoginPage.js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { userLogin } from 'react-admin';

class MyLoginPage extends Component {
    submit = (e) => {
        e.preventDefault();
        // gather your data/credentials here
        const credentials = { };

        // Dispatch the userLogin action (injected by connect)
        this.props.userLogin(credentials);
    }

    render() {
        return (
            <form onSubmit={this.submit}>
            ...
            </form>
        );
    }
};

export default connect(undefined, { userLogin })(MyLoginPage);

// in src/MyLogoutButton.js
import React from 'react';
import { connect } from 'react-redux';
import { Responsive, userLogout } from 'react-admin';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import ExitIcon from '@material-ui/icons/PowerSettingsNew';

const MyLogoutButton = ({ userLogout, ...rest }) => (
    <Responsive
        xsmall={
            <MenuItem
                onClick={userLogout}
                {...sanitizeRestProps(rest)}
            >
                <ExitIcon /> Logout
            </MenuItem>
        }
        medium={
            <Button
                onClick={userLogout}
                size="small"
                {...sanitizeRestProps(rest)}
            >
                <ExitIcon /> Logout
            </Button>
        }
    />
);
export default connect(undefined, { userLogout: userLogout() })(MyLogoutButton);

// in src/App.js
import MyLoginPage from './MyLoginPage';
import MyLogoutButton from './MyLogoutButton';

const App = () => (
    <Admin loginPage={MyLoginPage} logoutButton={MyLogoutButton} authProvider={authProvider}>
    ...
    </Admin>
);
```

## Restricting Access To A Custom Page

If you add [custom pages](./Actions.md), of if you [create an admin app from scratch](./CustomApp.md), you may need to secure access to pages manually. That's the purpose of the `<Authenticated>` component, that you can use as a decorator for your own components.

```jsx
// in src/MyPage.js
import { withRouter } from 'react-router-dom';
import { Authenticated } from 'react-admin';

const MyPage = ({ location }) => (
    <Authenticated authParams={{ foo: 'bar' }} location={location}>
        <div>
            ...
        </div>
    </Authenticated>
);

export default withRouter(MyPage);
```

The `<Authenticated>` component calls the `authProvider` function with `AUTH_CHECK` and `authParams`. If the response is a fulfilled promise, the child component is rendered. If the response is a rejected promise, `<Authenticated>` redirects to the login form. Upon successful login, the user is redirected to the initial location (that's why it's necessary to get the location from the router).

## Redirect After Logout

By default, react-admin redirects the user to '/login' after they log out. This can be changed by passing the url to redirect to as parameter to the `userLogout()` action creator when you `connect` the `MyLogoutButton` component:

```diff
// in src/MyLogoutButton.js
// ...
- export default connect(undefined, { userLogout: userLogout() })(MyLogoutButton);
+ export default connect(undefined, { userLogout: userLogout('/') })(MyLogoutButton);
```