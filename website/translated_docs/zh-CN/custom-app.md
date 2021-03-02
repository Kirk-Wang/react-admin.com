---
id: custom-app
title: 在其它 App 中包含 Admin
---

`<Admin>` 标签是一个很好的快捷方式，在几分钟内就可以启动和运行react-admin。 但是，在许多情况下，您需要将 admin 嵌入到另一个应用程序中，或者深入定制 admin。 幸运的是，您可以在任何 React 应用程序中执行 `<Admin>` 所做的所有工作。

请注意，您需要进一步了解 [redux](http://redux.js.org/)，[react-router](https://github.com/reactjs/react-router) 和 [redux-saga](https://github.com/yelouafi/redux-saga)。

**提示**：在进入自定义应用程序路线之前，请探索 [`Admin>` 组件](./Admin.md)的所有选项。 它们允许您添加自定义路由，自定义reducers，自定义sagas和自定义布局。

以下是使用3个资源引导一个准系统 react-admin 应用程序的主要代码：`posts`，`comments` 和 `users`：

```jsx
// in src/App.js
import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';

// redux, react-router, redux-form, saga, and material-ui
// form the 'kernel' on which react-admin runs
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createHistory from 'history/createHashHistory';
import { Switch, Route } from 'react-router-dom';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import createSagaMiddleware from 'redux-saga';
import { MuiThemeProvider } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

// prebuilt react-admin features
import {
    adminReducer,
    i18nReducer,
    adminSaga,
    TranslationProvider,
} from 'react-admin';
import restProvider from 'ra-data-simple-rest';
import defaultMessages from 'ra-language-english';

// your app components
import Dashboard from './Dashboard';
import { PostList, PostCreate, PostEdit, PostShow } from './Post';
import { CommentList, CommentEdit, CommentCreate } from './Comment';
import { UserList, UserEdit, UserCreate } from './User';
// your app labels
import messages from './i18n';

// create a Redux app
const reducer = combineReducers({
    admin: adminReducer,
    i18n: i18nReducer('en', messages['en']),
    form: formReducer,
    routing: routerReducer,
});
const sagaMiddleware = createSagaMiddleware();
const history = createHistory();
const store = createStore(reducer, undefined, compose(
    applyMiddleware(sagaMiddleware, routerMiddleware(history)),
    window.devToolsExtension ? window.devToolsExtension() : f => f,
));

// side effects
const dataProvider = restProvider('http://path.to.my.api/');
const authProvider = () => Promise.resolve();
const i18nProvider = locale => {
    if (locale !== 'en') {
        return messages[locale];
    }
    return defaultMessages;
};
sagaMiddleware.run(adminSaga(dataProvider, authProvider, i18nProvider));

// bootstrap redux and the routes
const App = () => (
    <Provider store={store}>
        <TranslationProvider>
            <ConnectedRouter history={history}>
                <MuiThemeProvider>
                    <AppBar position="static" color="default">
                        <Toolbar>
                            <Typography variant="title" color="inherit">
                                My admin
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <Switch>
                        <Route exact path="/" component={Dashboard} />
                        <Route exact path="/posts" hasCreate render={(routeProps) => <PostList resource="posts" {...routeProps} />} />
                        <Route exact path="/posts/create" render={(routeProps) => <PostCreate resource="posts" {...routeProps} />} />
                        <Route exact path="/posts/:id" hasShow render={(routeProps) => <PostEdit resource="posts" {...routeProps} />} />
                        <Route exact path="/posts/:id/show" hasEdit render={(routeProps) => <PostShow resource="posts" {...routeProps} />} />
                        <Route exact path="/comments" hasCreate render={(routeProps) => <CommentList resource="comments" {...routeProps} />} />
                        <Route exact path="/comments/create" render={(routeProps) => <CommentCreate resource="comments" {...routeProps} />} />
                        <Route exact path="/comments/:id" render={(routeProps) => <CommentEdit resource="comments" {...routeProps} />} />
                        <Route exact path="/users" hasCreate render={(routeProps) => <UsersList resource="users" {...routeProps} />} />
                        <Route exact path="/users/create" render={(routeProps) => <UsersCreate resource="users" {...routeProps} />} />
                        <Route exact path="/users/:id" render={(routeProps) => <UsersEdit resource="users" {...routeProps} />} />
                    </Switch>
                </MuiThemeProvider>
            </ConnectedRouter>
        </TranslationProvider>
    </Provider>
);
```

此应用程序没有侧边栏，没有主题，没有[auth control](./Authentication.md#restricting-access-to-a-custom-page) - 由你自己添加。 从那时起，你可以自定义几乎任何你想要的。