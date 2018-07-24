---
id: resource-component
title: <Resource>
---
一个 `<Resource>` 组件将一个API端点映射到一个CRUD界面。 例如，下面的 admin app 为 JSONPlaceholder API 公开在[`http://jsonplaceholder.ode.com/posts`](http://jsonplaceholder.typicode.com/posts) 和 [`http://jsonplaceholder.ode.com/users`](http://jsonplaceholder.typicode.com/users) 的资源提供了一个只读界面：

```jsx
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';

import { PostList } from './posts';
import { UserList } from './users';

const App = () => (
    <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
        <Resource name="posts" list={PostList} />
        <Resource name="users" list={UserList} />
    </Admin>
);
```

`<Resource>` 允许您使用以下属性名称为每个 CRUD 操作定义组件:

* `list`
* `create`
* `edit`
* `show`

这里是一个更完整的admin，具有所有 CRUD 操作的组件:

```jsx
import React from 'react';
import { Admin, Resource } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';

import { PostList, PostCreate, PostEdit, PostShow, PostIcon } from './posts';
import { UserList } from './posts';
import { CommentList, CommentEdit, CommentCreate, CommentIcon } from './comments';

const App = () => (
    <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
        <Resource name="posts" list={PostList} create={PostCreate} edit={PostEdit} show={PostShow} icon={PostIcon} />
        <Resource name="users" list={UserList} />
        <Resource name="comments" list={CommentList} create={CommentCreate} edit={CommentEdit} icon={CommentIcon} />
        <Resource name="tags" />
    </Admin>
);
```

提示：在引擎盖下，`<Resource>` 组件使用 react-router 创建多个路由：

* `/` maps to the `list` component
* `/create` maps to the `create` component
* `/:id` maps to the `edit` component
* `/:id/show` maps to the `show` component

**提示**：在声明引用时（通过`<ReferenceField>`，`<ReferenceArrayField>`，`<ReferenceManyField>`，`<ReferenceInput>` 或 `<ReferenceArrayInput>`），必须添加一个`<Resource>`，因为react-admin使用 Resource 来定义数据存储结构。 这就是上面示例中有一个空的 `tag` 资源的原因。

`<Resource>` 也接受额外的属性：

* [`name`](#name)
* [`icon`](#icon)
* [`options`](#icon)

## `name`

React-admin 使用 `name` 属性既确定API端点（被传递到`dataProvider`）又为resource构成URL。

```jsx
<Resource name="posts" list={PostList} create={PostCreate} edit={PostEdit} show={PostShow} />
```

对于此资源， react-admin 将为数据获取 `http://jsonplaceholder.typicode.com/posts`端点。

路由将按如下方式映射组件:

* `/posts/` maps to `PostList`
* `/posts/create` maps to `PostCreate`
* `/posts/:id` maps to `PostEdit`
* `/posts/:id/show` maps to `PostShow`

**Tip**: If you want to use a special API endpoint (e.g. 'http://jsonplaceholder.typicode.com/my-custom-posts-endpoint') without altering the URL in the react-admin application (so still use `/posts`), write the mapping from the resource `name` (`posts`) to the API endpoint (`my-custom-posts-endpoint`) in your own [`dataProvider`](./Admin.md#dataprovider)

## `icon`

React-admin 将在菜单中呈现 `icon` 属性组件:

```jsx
// in src/App.js
import React from 'react';
import PostIcon from '@material-ui/icons/Book';
import UserIcon from '@material-ui/icons/People';
import { Admin, Resource } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';

import { PostList } from './posts';

const App = () => (
    <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
        <Resource name="posts" list={PostList} icon={PostIcon} />
        <Resource name="users" list={UserList} icon={UserIcon} />
    </Admin>
);
```

## options

`options.label` 允许在菜单中自定义显示给定资源的名称。

```jsx
<Resource name="v2/posts" options={{ label: 'Posts' }} list={PostList} />
```