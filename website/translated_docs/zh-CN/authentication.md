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

## 在导航过程中检查凭据

当 REST 响应使用 401 状态代码时，重定向到登录页面通常是不够的，因为 react-admin 保留数据在客户端，并且可能在联系服务器时显示过时的数据 - 即使凭据不再有效。

幸运的是，每当用户导航时，react-admin 都使用 `AUTH_CHECK` type 调用`authProvider`，因此它是检查凭据的理想场所。

例如，要检查本地存储中的令牌是否存在：

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

如果promise被拒绝，默认情况下 react-admin 重定向到 `/login` 页面。 您可以通过将具有 `redirectTo` 属性的参数传递给被拒绝的 promise 来覆盖用户重定向的位置：

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

**提示**：对于 `AUTH_CHECK` 调用，`params` 参数包含`resource`名称，因此可以为不同的资源实现不同的检查：

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

**提示**：`authClient` 只能用 `AUTH_LOGIN`，`AUTH_LOGOUT`，`AUTH_ERROR` 或 `AUTH_CHECK` 调用；这就是为什么最终返回一个拒绝的 promise。

## 自定义登录和注销组件

如果身份验证依赖于用户名和密码，则使用 `authProvider` 和 `checkCredentials` 就可以实现全功能授权系统。

但是如果您想使用电子邮件而不是用户名呢？ 如果要使用带有第三方身份验证服务的单点登录（SSO），该怎么办？如果要使用双重身份认证怎么办？

对于所有这些情况，您需要实现自己的 `LoginPage` 组件，该组件将显示在 `/login` 路由下，而不是默认的用户名/密码表单以及您自己的 `LogoutButton` 组件，这将显示在侧边栏。 将这两个组件都传递给 `<Admin>` 组件：

**提示**：在您的自定义 `Login` 和 `Logout` 组件中使用 `userLogin` 和 `userLogout` action。

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

## 限制对自定义页面的访问

如果您添加[自定义页面](./Actions.md)，如果您[从头开始创建admin app](./CustomApp.md)，则可能需要手动保护对页面的访问。 这就是 `<Authenticated>` 组件的目的，您可以将其用作自己组件的装饰器。

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

`<Authenticated>` 组件使用 `AUTH_CHECK` 和 `uthParams` 调用 `authProvider` 函数。 如果响应是一个fulfilled promise，则子组件被渲染。 如果响应是被拒绝的 promise，`<Authenticated>` 将重定向到登录表单。 成功登录后，用户将被重定向到初始位置（这就是为什么必须从路由器获取位置）。

## 注销后重定向

默认情况下，react-admin在用户注销后会将用户重定向到 “/login”。 当您 `connect` 到 `MyLogoutButton`组件时，可以通过将 url 传递给 `userLogout()` action 创建者作为参数来更改：

```diff
// in src/MyLogoutButton.js
// ...
- export default connect(undefined, { userLogout: userLogout() })(MyLogoutButton);
+ export default connect(undefined, { userLogout: userLogout('/') })(MyLogoutButton);
```