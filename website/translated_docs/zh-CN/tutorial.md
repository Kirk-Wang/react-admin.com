---
id: tutorial
title: 教程
---
这15分钟的教程将揭示如何创建一个新的管理应用程序基于现有的 REST API。<video width="800" height="600" controls> <source src="http://static.marmelab.com/react-admin/react-admin.mp4" type="video/mp4"> Your browser does not support the video tag. </video> 

## 设置

React-Admin使用React。 我们将使用 Facebook 的 [create-react-app](https://github.com/facebookincubator/create-react-app) 创建一个空的React app, 并安装 `react-admin` 软件包:

```sh
npm install -g create-react-app
create-react-app test-admin
cd test-admin/
yarn add react-admin
yarn start
```

您应该是在3000端口上启动并运行着一个空的React应用程序。

## 使用 API 作为数据源

React-admin运行在浏览器中, 并使用 API 获取和存储数据。

我们将使用 [JSONPlaceholder](http://jsonplaceholder.typicode.com/), 一个用于测试和原型设计的假 REST API, 作为管理员的数据源。下面是它的样子：

    curl http://jsonplaceholder.typicode.com/posts/12
    

```json
{
  "id": 12,
  "title": "in quibusdam tempore odit est dolorem",
  "body": "itaque id aut magnam\npraesentium quia et ea odit et ea voluptas et\nsapiente quia nihil amet occaecati quia id voluptatem\nincidunt ea est distinctio odio",
  "userId": 2
}
```

JSONPlaceholder为帖子，评论和用户提供端点（API）。 我们建立的管理员将允许创建，检索，更新和删除（CRUD）这些资源。

## 使用Data Provider与API进行联系

通过以下代码替换`src/App.js`来引导admin app：

```jsx
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';

const dataProvider = jsonServerProvider('http://jsonplaceholder.typicode.com');
const App = () => <Admin dataProvider={dataProvider} />;

export default App;
```

`App` 组件现在渲染了一个 `<Admin>` 组件, 它是react-admin应用程序的根组件。 该组件需要一个`dataProvider` 属性- 一个能够从API获取数据的函数。 由于计算机之间并没有数据交换的标准，因此您可能必须编写自定义提供程序（Provider）以便将react-admin连接到您自己的API- 稍后我们会深入了解数据提供程序（Data Providers）。 现在, 让我们利用 `ra-data-json-server` 数据提供程序, 它将适用于JSONPlaceholder 。

```sh
yarn add ra-data-json-server
```

这足以让react-admin运行一个空的应用程序。现在是添加功能的时候了!

## 使用Resource映射API端点

`<Admin>` 组件需要一个或多个 `<Resource>` 子级组件。 每个Resource映射一个名称到 API 中的端点。 编辑 `App.js` 文件来添加一个`posts`资源:

```jsx
// in src/App.js
import { PostList } from './posts';

const App = () => (
    <Admin dataProvider={dataProvider}>
        <Resource name="posts" list={PostList} />
    </Admin>
);
```

**提示**: 在下一节中, 我们将定义 `<PostList>` 组件。

`<Resource name="posts" />` 这一行通知react-admin从 [http://jsonplaceholder.typicode.com/posts ](http://jsonplaceholder.typicode.com/posts) URL上获取 "posts" 记录。

## 显示记录列表

`<Resource>` 还定义了每个 CRUD 操作所使用的React组件 （`列表（list）`, `创建（create）`, `编辑（edit）`, `显示（show）`）。 `list={PostList}`属性意味着react-admin应该使用 `<PostList>` 组件来显示帖子列表。 按如下方式创建该组件:

```jsx
// in src/posts.js
import React from 'react';
import { List, Datagrid, TextField } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="body" />
        </Datagrid>
    </List>
);
```

PostList的主要组件是 `<List>` 组件，负责从 API 中抓取信息，显示页面标题，以及处理页。 然后, 该List将实际posts列表的显示委托给其子级。 在这种情况下, 这是一个 `<Datagrid>` 组件, 它渲染为一张表，一行一条记录。 datagrid 使用其子组件 (此处为 `<TextField>`) 来确定要呈现的列。 每个域组件在 API 响应中映射一个不同的域, 由 `source`属性指定。

这足以显示Post列表：

![Simple posts list](https://marmelab.com/react-admin/img/simple-post-list.png)

如果你在浏览器开发者工具中查看网络选项卡时, 则会注意到应用程序拉取了 `http://jsonplaceholder.typicode.com/posts` URL, 然后使用结果（数据）生成 datagrid。 这些基本上解释了react-admin是如何工作的。

该列表已经功能化: 您可以通过单击列标题来重新排序, 或者使用底部分页控件更改页面。 `ra-data-json-server` 数据提供程序（Data Provider）将这些操作转换为 JSONPlaceholder 理解的查询字符串。

## 使用字段类型

你刚看到`<TextField>`组件，React-admin提供了许多字段组件去映射各种内容类型： number，date， image，HTML,，array，reference等。

例如, [ `/user` API端点在 JSONPlaceholder](http://jsonplaceholder.typicode.com/users) 中包含电子邮件。

    curl http://jsonplaceholder.typicode.com/users/2
    

```json
{
  "id": 2,
  "name": "Ervin Howell",
  "username": "Antonette",
  "email": "Shanna@melissa.tv",
}
```

让我们创建一个新的 `users` 资源来获取该端点。在 `src` 中添加它：

```jsx
// in src/App.js
import { PostList } from './posts';
import { UserList } from './users';

const App = () => (
    <Admin dataProvider={dataProvider}>
        <Resource name="posts" list={PostList} />
        <Resource name="users" list={UserList} />
    </Admin>
);
```

现在, 创建 `users. js` 文件导出 `UserList`，使用 `<EmailField>` 映射 `电子邮件` 字段：

```jsx
// in src/users.js
import React from 'react';
import { List, Datagrid, EmailField, TextField } from 'react-admin';

export const UserList = (props) => (
    <List title="All users" {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="username" />
            <EmailField source="email" />
        </Datagrid>
    </List>
);
```

![Simple user datagrid](https://marmelab.com/react-admin/img/simple-user-list.png)

边栏现在提供了对第二个资源“users”的访问。你可以点击它，它工作了！“users” 列表将电子邮件地址显示为 `<a href="mailto:">` 标记。

在react-admin中， Field是简单的react 组件。 在运行时, 它们接收从 API 获取的 `记录` (例如, `{ "id": 2, "name": "Ervin Howell", "username": "Antonette", "email": "Shanna@melissa.tv" }`) 并且他们应该显示`source`所指定的字段 (如：`email`)。

这意味着编写自定义字段组件非常简单。例如，去创建一个`UrlField`：

```jsx
// in src/MyUrlField.js
import React from 'react';
import PropTypes from 'prop-types';

const UrlField = ({ record = {}, source }) =>
    <a href={record[source]}>
        {record[source]}
    </a>;

UrlField.propTypes = {
    record: PropTypes.object,
    source: PropTypes.string.isRequired,
};

export default UrlField;
```

## 处理关联性

在 JSONPlaceholder 中, 每个 `post` 记录都包括一个 `userId` 字段, 它指向一个 `user`：

```json
{
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto",
    "userId": 1
}
```

React-admin知道如何利用这些外键来获取引用。例如，在这些post列表中包含用户名，使用`<ReferenceField>`：

```jsx
// in src/posts.js
import React from 'react';
import { List, Datagrid, TextField, EmailField, ReferenceField } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <ReferenceField label="User" source="userId" reference="users">
                <TextField source="name" />
            </ReferenceField>
            <TextField source="title" />
            <TextField source="body" />
        </Datagrid>
    </List>
);
```

当我们显示这些帖子列表时，这个 app 现在会获取关联的用户纪录，并显示他们的 `name` 作为一个 `<TextField>` 。 请注意 `label` 属性： 可以在任何字段组件上使用它来自定义字段标签。

![reference posts in comment list](https://marmelab.com/react-admin/img/reference-posts.png)

**提示**：单独的 `<ReferenceField>` 组件不显示任何内容。 它只提取引用数据, 并将其作为 `record` 传递给其子组件。 就像 `<List>` 组件, 所有 `<Reference>` 组件只负责获取和准备数据, 并将呈现委托给其子级。

**提示**：再次查看浏览器的网络选项卡：react-admin对users的请求进行重复删除，并聚合它们，以便对于整个datagrid向 `/ users` 端点只发出*一个*HTTP请求。 这是保持UI快速响应的众多优化之一。

## 添加创建和编辑功能

管理界面不仅仅是显示远程数据，还应该允许创建和编辑记录。 React-admin 提供了`<Create>`和`<Edit>`组件来做这件事。 添加它们到`posts.js`脚本：

```jsx
// in src/posts.js
import React from 'react';
import { List, Edit, Create, Datagrid, ReferenceField, TextField, EditButton, DisabledInput, LongTextInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <ReferenceField label="User" source="userId" reference="users">
                <TextField source="name" />
            </ReferenceField>
            <TextField source="title" />
            <TextField source="body" />
            <EditButton />
        </Datagrid>
    </List>
);

const PostTitle = ({ record }) => {
    return <span>Post {record ? `"${record.title}"` : ''}</span>;
};

export const PostEdit = (props) => (
    <Edit title={<PostTitle />} {...props}>
        <SimpleForm>
            <DisabledInput source="id" />
            <ReferenceInput label="User" source="userId" reference="users">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <TextInput source="title" />
            <LongTextInput source="body" />
        </SimpleForm>
    </Edit>
);

export const PostCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <ReferenceInput label="User" source="userId" reference="users">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <TextInput source="title" />
            <LongTextInput source="body" />
        </SimpleForm>
    </Create>
);
```

如果你已经理解`<List>`组件，这个`<Edit>`和`<Create>`组件将不足为奇。 他们负责获取记录（或者在`<Create>`的情况下初始化空记录），并显示页面标题。 它们传递纪录到这个`<SimpleForm>`组件，它负责表单布局，默认值，和验证。 就像`<Datagrid>`，`<SimpleForm>`用它的子组件来确定要显示的表单输入项。 它期望*input components*作为字组件。 `<DisabledInput>`，`<TextInput>`，`<LongTextInput>`和`<ReferenceInput>`都是这样的组件。

至于`<ReferenceInput>`，它采用相同的属性作为`<ReferenceField>`（在早先的列表页用过）。 `<ReferenceInput>`用这些属性去获取可能引用关联到当前纪录的API（在这个例子中, 可能 `users`关联到了当前的`post`）。 它然后传递这些可能的引用到子组件（`<SelectInput>`），它是负责显示它们（在这种情况通过它们的`name`字段），并且让用户选择一个。 在HTML中`<SelectInput>`渲染为一个`<select>`标签。

**提示**：`<Edit>`和`<Create>`组件使用了几乎相同的子表单，但`<Edit>`中的附加`id` input 除外。 在大多数情况下, 创建和编辑记录的表单会有点不同。 但是, 如果它们相同, 则可以在两者之间共享一个常见的表单组件。

注意在`<PostList>`子组件中增加的`<EditButton>`字段：这是给予获得编辑页的访问。 另外, `<Edit>` 组件使用自定义 `<PostTitle>` 组件作为标题, 它显示了自定义给定页的标题的方式。

要在posts资源中使用新的`<PostEdit>`和`<PostCreate>`组件，只需将它们添加成为`<Resource>`组件的edit和create属性：

```jsx
// in src/App.js
import { PostList, PostEdit, PostCreate } from './posts';
import { UserList } from './users';

const App = () => (
    <Admin dataProvider={dataProvider}>
        <Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} />
        // ...
    </Admin>
);
```

在 posts 列表顶部 React-admin 自动地添加了一个 “create” 按钮来给予访问`<PostCreate>`组件。 并且 `<EditButton>`呈现在列表中的每一行来提供访问`<PostEdit>`组件。

![post list with access to edit and create](https://marmelab.com/react-admin/img/editable-post.png)

这个表单在创建和编辑页中已经是可使用了的。在提交上它分别发送`POST`和`PUT`请求到REST API。

![post edition form](https://marmelab.com/react-admin/img/post-edition.png)

**注释**：JSONPlaceholder是一个只读的 api；虽然它似乎接受`POST`和`PUT`请求，但它并没有考虑账户的新建和编辑 - 这就是为什么，在这种特定情况下，你将在创建后看到错误，并且在保存之后将不会看到你的编辑。 这只是 JSONPlaceholder 的一个假象。

React-admin使用 *积极（optimistic ）呈现*。 这意味着, 当您编辑记录并点击 “保存” 按钮时, UI 将显示一个确认, 并在*将更新查询发送到服务器之前*显示更新后的数据 。 这不仅使界面超快，而且还允许“Undo”功能。 它已经在admin中作为一个功能点了。 尝试编辑记录，然后在滑出之前点击黑色确认栏中的“Undo”链接。 您将看到应用程序不会将 `UPDATE` 查询发送到 API，并显示未修改的数据。

**注意**：添加编辑项目的功能时，还可以添加删除项目的功能。 编辑视图中的 “Delete” 按钮完全开箱即用。

## 向列表中添加搜索和筛选器

让我们回到Post列表一分钟。它提供排序和分页, 但缺少一个功能: 搜索内容的能力。

React-admin可以使用输入组件在列表视图中创建多标准搜索引擎。 首先, 创建一个 `<Filter>` 组件, 就像您将编写一个 `<SimpleForm>` 组件, 使用输入组件作为子级。 然后, 使用 `filters` 属性将其添加到List中:

```jsx
// in src/posts.js
import { Filter, ReferenceInput, SelectInput, TextInput } from 'react-admin';

const PostFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
        <ReferenceInput label="User" source="userId" reference="users" allowEmpty>
            <SelectInput optionText="name" />
        </ReferenceInput>
    </Filter>
);

export const PostList = (props) => (
    <List {...props} filters={<PostFilter />}>
        // ...
    </List>
);
```

第一个过滤器 ‘q’ 利用了JSONPlaceholder提供的全文功能。 它是 `alwaysOn`，所以它总是出现在屏幕上。 第二个筛选器，‘userId’ 可以通过位于列表顶部的 “add filter” 按钮来添加。 As it's a `<ReferenceInput>`, it's already populated with possible users. It can be turned off by the end user.

![posts search engine](https://marmelab.com/react-admin/img/filters.gif)

Filters are "search-as-you-type", meaning that when the user enters new values in the filter form, the list refreshes (via an API request) immediately.

## Customizing the Menu Icons

The sidebar menu shows the same icon for both posts and users. Customizing the menu icon is just a matter of passing an `icon` attribute to each `<Resource>`:

```jsx
// in src/App.js
import PostIcon from '@material-ui/icons/Book';
import UserIcon from '@material-ui/icons/Group';

const App = () => (
    <Admin dataProvider={dataProvider}>
        <Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} icon={PostIcon} />
        <Resource name="users" list={UserList} icon={UserIcon} />
    </Admin>
);
```

![custom menu icons](https://marmelab.com/react-admin/img/custom-menu.gif)

## Using a Custom Home Page

By default, react-admin displays the list page of the first resource as home page. If you want to display a custom component instead, pass it in the `dashboard` prop of the `<Admin>` component.

```jsx
// in src/Dashboard.js
import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';

export default () => (
    <Card>
        <CardHeader title="Welcome to the administration" />
        <CardContent>Lorem ipsum sic dolor amet...</CardContent>
    </Card>
);
```

```jsx
// in src/App.js
import Dashboard from './Dashboard';

const App = () => (
    <Admin dashboard={Dashboard} dataProvider={dataProvider}>
        // ...
    </Admin>
);
```

![Custom home page](https://marmelab.com/react-admin/img/dashboard.png)

## Adding a Login Page

Most admin apps require authentication. React-admin can check user credentials before displaying a page, and redirect to a login form when the REST API returns a 403 error code.

*What* those credentials are, and *how* to get them, are questions that you, as a developer, must answer. React-admin makes no assumption about your authentication strategy (basic auth, OAuth, custom route, etc), but gives you the hooks to plug your logic at the right place - by calling an `authProvider` function.

For this tutorial, since there is no public authentication API we can use, let's use a fake authentication provider that accepts every login request, and stores the `username` in `localStorage`. Each page change will require that `localStorage` contains a `username` item.

The `authProvider` is a simple function, which must return a `Promise`:

```jsx
// in src/authProvider.js
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'react-admin';

export default (type, params) => {
    // called when the user attempts to log in
    if (type === AUTH_LOGIN) {
        const { username } = params;
        localStorage.setItem('username', username);
        // accept all username/password combinations
        return Promise.resolve();
    }
    // called when the user clicks on the logout button
    if (type === AUTH_LOGOUT) {
        localStorage.removeItem('username');
        return Promise.resolve();
    }
    // called when the API returns an error
    if (type === AUTH_ERROR) {
        const { status } = params;
        if (status === 401 || status === 403) {
            localStorage.removeItem('username');
            return Promise.reject();
        }
        return Promise.resolve();
    }
    // called when the user navigates to a new location
    if (type === AUTH_CHECK) {
        return localStorage.getItem('username')
            ? Promise.resolve()
            : Promise.reject();
    }
    return Promise.reject('Unknown method');
};
```

**Tip**: As the `dataProvider` response is asynchronous, you can easily fetch an authentication server in there.

To enable this authentication strategy, pass the client as the `authProvider` prop in the `<Admin>` component:

```jsx
// in src/App.js
import Dashboard from './Dashboard';
import authProvider from './authProvider';

const App = () => (
    <Admin dashboard={Dashboard} authProvider={authProvider} dataProvider={dataProvider}>
        // ...
    </Admin>
);
```

Once the app reloads, it's now behind a login form that accepts everyone:

![Login form](https://marmelab.com/react-admin/img/login.gif)

## Supporting Mobile Devices

The react-admin layout is already responsive. Try to resize your browser to see how the sidebar switches to a drawer on smaller screens.

But a responsive layout is not enough to make a responsive app. Datagrid components work well on desktop, but are absolutely not adapted to mobile devices. If your admin must be used on mobile devices, you'll have to provide an alternative component for small screens.

First, you should know that you don't have to use the `<Datagrid>` component as `<List>` child. You can use any other component you like. For instance, the `<SimpleList>` component:

```jsx
// in src/posts.js
import React from 'react';
import { List, SimpleList } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <SimpleList
            primaryText={record => record.title}
            secondaryText={record => `${record.views} views`}
            tertiaryText={record => new Date(record.published_at).toLocaleDateString()}
        />
    </List>
);
```

The `<SimpleList>` component uses [material-ui's `<List>` and `<ListItem>` components](http://www.material-ui.com/#/components/list), and expects functions as `primaryText`, `secondaryText`, and `tertiaryText` props.

<img src="https://marmelab.com/react-admin/img/mobile-post-list.png" alt="Mobile post list" style="display:block;margin:2em auto;box-shadow:none;filter:drop-shadow(13px 12px 7px rgba(0,0,0,0.5));" />

**Note:** We switched to a custom API for those screenshots in order to demonstrate how to use some of the `SimpleList` component props.

That works fine on mobile, but now the desktop user experience is worse. The best compromise would be to use `<SimpleList>` on small screens, and `<Datagrid>` on other screens. That's where the `<Responsive>` component comes in:

```jsx
// in src/posts.js
import React from 'react';
import { List, Responsive, SimpleList, Datagrid, TextField, ReferenceField, EditButton } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <Responsive
            small={
                <SimpleList
                    primaryText={record => record.title}
                    secondaryText={record => `${record.views} views`}
                    tertiaryText={record => new Date(record.published_at).toLocaleDateString()}
                />
            }
            medium={
                <Datagrid>
                    <TextField source="id" />
                    <ReferenceField label="User" source="userId" reference="users">
                        <TextField source="name" />
                    </ReferenceField>
                    <TextField source="title" />
                    <TextField source="body" />
                    <EditButton />
                </Datagrid>
            }
        />
    </List>
);
```

This works exactly the way you expect. The lesson here is that react-admin takes care of responsive web design for the layout, but it's your job to use `<Responsive>` in pages.

![Responsive List](https://marmelab.com/react-admin/img/responsive-list.gif)

## Connecting To A Real API

Here is the elephant in the room of this tutorial. In real world projects, the dialect of your API (REST? GraphQL? Something else?) won't match the JSONPLaceholder dialect. Writing a Data Provider is probably the first thing you'll have to do to make react-admin work. Depending on your API, this can require a few hours of additional work.

React-admin delegates every data query to a Data Provider function. This function must simply return a promise for the result. This gives extreme freedom to map any API dialect, add authentication headers, use endpoints from several domains, etc.

For instance, let's imagine you have to use the `my.api.url` REST API, which expects the following parameters:

| Action              | Expected API request                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Get list            | `GET http://my.api.url/posts?sort=['title','ASC']&range=[0, 24]&filter={title:'bar'}` |
| Get one record      | `GET http://my.api.url/posts/123`                                                             |
| Get several records | `GET http://my.api.url/posts?filter={ids:[123,456,789]}`                                      |
| Update a record     | `PUT http://my.api.url/posts/123`                                                             |
| Create a record     | `POST http://my.api.url/posts/123`                                                            |
| Delete a record     | `DELETE http://my.api.url/posts/123`                                                          |

React-admin defines custom verbs for each of the actions of this list. Just like HTTP verbs (`GET`, `POST`, etc.), react-admin verbs qualify a request to a data provider. React-admin verbs are called `GET_LIST`, `GET_ONE`, `GET_MANY`, `CREATE`, `UPDATE`, and `DELETE`. The Data Provider will have to map each of these verbs to one (or many) HTTP request(s).

The code for a Data Provider for the `my.api.url` API is as follows:

```jsx
// in src/dataProvider
import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    DELETE,
    fetchUtils,
} from 'react-admin';
import { stringify } from 'query-string';

const API_URL = 'my.api.url';

/**
 * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
 * @param {String} resource Name of the resource to fetch, e.g. 'posts'
 * @param {Object} params The Data Provider request params, depending on the type
 * @returns {Object} { url, options } The HTTP request parameters
 */
const convertDataProviderRequestToHTTP = (type, resource, params) => {
    switch (type) {
    case GET_LIST: {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        };
        return { url: `${API_URL}/${resource}?${stringify(query)}` };
    }
    case GET_ONE:
        return { url: `${API_URL}/${resource}/${params.id}` };
    case GET_MANY: {
        const query = {
            filter: JSON.stringify({ id: params.ids }),
        };
        return { url: `${API_URL}/${resource}?${stringify(query)}` };
    }
    case GET_MANY_REFERENCE: {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, (page * perPage) - 1]),
            filter: JSON.stringify({ ...params.filter, [params.target]: params.id }),
        };
        return { url: `${API_URL}/${resource}?${stringify(query)}` };
    }
    case UPDATE:
        return {
            url: `${API_URL}/${resource}/${params.id}`,
            options: { method: 'PUT', body: JSON.stringify(params.data) },
        };
    case CREATE:
        return {
            url: `${API_URL}/${resource}`,
            options: { method: 'POST', body: JSON.stringify(params.data) },
        };
    case DELETE:
        return {
            url: `${API_URL}/${resource}/${params.id}`,
            options: { method: 'DELETE' },
        };
    default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }
};

/**
 * @param {Object} response HTTP response from fetch()
 * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
 * @param {String} resource Name of the resource to fetch, e.g. 'posts'
 * @param {Object} params The Data Provider request params, depending on the type
 * @returns {Object} Data Provider response
 */
const convertHTTPResponseToDataProvider = (response, type, resource, params) => {
    const { headers, json } = response;
    switch (type) {
    case GET_LIST:
        return {
            data: json.map(x => x),
            total: parseInt(headers.get('content-range').split('/').pop(), 10),
        };
    case CREATE:
        return { data: { ...params.data, id: json.id } };
    default:
        return { data: json };
    }
};

/**
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the request type
 * @returns {Promise} the Promise for response
 */
export default (type, resource, params) => {
    const { fetchJson } = fetchUtils;
    const { url, options } = convertDataProviderRequestToHTTP(type, resource, params);
    return fetchJson(url, options)
        .then(response => convertHTTPResponseToDataProvider(response, type, resource, params));
};
```

**Tip**: `fetchJson()` is just a shortcut for `fetch().then(r => r.json())`, plus a control of the HTTP response code to throw an `HTTPError` in case of 4xx or 5xx response. Feel free to use `fetch()` directly if it doesn't suit your needs.

Using this provider instead of the previous `jsonServerProvider` is just a matter of switching a function:

```jsx
// in src/app.js
import dataProvider from './dataProvider';

const App = () => (
    <Admin dataProvider={dataProvider}>
        // ...
    </Admin>
);
```

## Conclusion

React-admin was built with customization in mind. You can replace any react-admin component with a component of your own, for instance to display a custom list layout, or a different edit form for a given resource.

Now that you've completed the tutorial, continue reading the [react-admin documentation](http://marmelab.com/react-admin/), and read the [Material UI components documentation](http://www.material-ui.com/#/).