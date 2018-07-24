---
id: show-view-component
title: <Show> View
---
Show 视图以只读方式显示从 API 获取的记录。 它将记录的实际呈现方式委托给一个布局组件——通常是 `<SimpleShowLayout>`。 此布局组件使用其子级 ([`<Fields>`](./Fields.md) 组件) 来呈现每个记录字段。

![post show view](https://marmelab.com/react-admin/img/show-view.png)

## `Show` 组件

`<Show>` 组件呈现页标题和 action, 并从 REST API 中提取记录。 它不负责呈现实际记录-这是其子组件 (通常为 `<SimpleShowLayout>`) 的工作, 它们通过 `record` 作为属性。

以下是 `<Show>` 组件所接受的所有属性：

* [`title`](#page-title)
* [`actions`](#actions)

以下是 show 视图显示帖子所需的最少代码：

```jsx
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';

import { PostCreate, PostEdit, PostShow } from './posts';

const App = () => (
    <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
        <Resource name="posts" show={PostShow} create={PostCreate} edit={PostEdit} />
    </Admin>
);

export default App;

// in src/posts.js
import React from 'react';
import { Show, SimpleShowLayout, TextField, DateField, EditButton, RichTextField } from 'react-admin';

export const PostShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="title" />
            <TextField source="teaser" />
            <RichTextField source="body" />
            <DateField label="Publication date" source="created_at" />
        </SimpleShowLayout>
    </Show>
);
```

That's enough to display the post show view:

![post show view](https://marmelab.com/react-admin/img/post-show.png)

### Page Title

默认情况下，Show 视图的显示标题是"[resource_name] #[record_id]"。

您可以通过指定一个自定义 `title` 属性来自定义此标题：

```jsx
export const PostShow = (props) => (
    <Show title="Post view" {...props}>
        ...
    </Show>
);
```

更有趣的是，你可以通过传递一个组件作为 `title`。 React-admin 克隆此组件，并在 `<ShowView>` 中注入当前 `record`。 这允许根据当前记录自定义标题：

```jsx
const PostTitle = ({ record }) => {
    return <span>Post {record ? `"${record.title}"` : ''}</span>;
};
export const PostShow = (props) => (
    <Show title={<PostTitle />} {...props}>
        ...
    </Show>
);
```

### Actions

你可以通过你自己的元素使用 `actions` 属性来替换默认 action 列表：

```jsx
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { ListButton, EditButton, DeleteButton, RefreshButton } from 'react-admin';

const cardActionStyle = {
    zIndex: 2,
    display: 'inline-block',
    float: 'right',
};

const PostShowActions = ({ basePath, data, resource }) => (
    <CardActions style={cardActionStyle}>
        <EditButton basePath={basePath} record={data} />
        <ListButton basePath={basePath} />
        <DeleteButton basePath={basePath} record={data} resource={resource} />
        <RefreshButton />
        {/* Add your custom actions */}
        <Button color="primary" onClick={customAction}>Custom Action</Button>
    </CardActions>
);

export const PostShow = (props) => (
    <Show actions={<PostShowActions />} {...props}>
        ...
    </Show>
);
```

## `SimpleShowLayout` 组件

The `<SimpleShowLayout>` component receives the `record` as prop from its parent component. It is responsible for rendering the actual view.

The `<SimpleShowLayout>` renders its child components line by line (within `<div>` components).

```jsx
export const PostShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="title" />
            <RichTextField source="body" />
            <NumberField source="nb_views" />
        </SimpleShowLayout>
    </Show>
);
```

It is possible to override its style by specifying the `style` prop, for example:

```jsx
const styles = {
    container: {
        display: 'flex',
    },
    item: {
        marginRight: '1rem',
    },
};

export const PostShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout style={styles.container}>
            <TextField source="title" style={styles.item} />
            <RichTextField source="body" style={styles.item} />
            <NumberField source="nb_views" style={styles.item} />
        </SimpleShowLayout>
    </Show>
);
```

## The `TabbedShowLayout` component

Just like `<SimpleShowLayout>`, `<TabbedShowLayout>` receives the `record` prop and renders the actual view. However, the `<TabbedShowLayout>` component renders fields grouped by tab. The tabs are set by using `<Tab>` components, which expect a `label` and an optional `icon` prop. Switching tabs will update the current url. By default, it uses the tabs indexes and the first tab will be displayed at the root url. You can customize the path by providing a `path` prop to each `Tab` component. If you'd like the first one to act as an index page, just omit the `path` prop.

![tabbed show](https://marmelab.com/react-admin/img/tabbed-show.gif)

```jsx
import { TabbedShowLayout, Tab } from 'react-admin'

export const PostShow = (props) => (
    <Show {...props}>
        <TabbedShowLayout>
            <Tab label="summary">
                <TextField label="Id" source="id" />
                <TextField source="title" />
                <TextField source="teaser" />
            </Tab>
            <Tab label="body" path="body">
                <RichTextField source="body" addLabel={false} />
            </Tab>
            <Tab label="Miscellaneous" path="miscellaneous">
                <TextField label="Password (if protected post)" source="password" type="password" />
                <DateField label="Publication date" source="published_at" />
                <NumberField source="average_note" />
                <BooleanField label="Allow comments?" source="commentable" defaultValue />
                <TextField label="Nb views" source="views" />
            </Tab>
            <Tab label="comments" path="comments">
                <ReferenceManyField reference="comments" target="post_id" addLabel={false}>
                    <Datagrid>
                        <TextField source="body" />
                        <DateField source="created_at" />
                        <EditButton />
                    </Datagrid>
                </ReferenceManyField>
            </Tab>
        </TabbedShowLayout>
    </Show>
);
```

## Displaying Fields depending on the user permissions

You might want to display some fields only to users with specific permissions. Those permissions are retrieved for each route and will provided to your component as a `permissions` prop.

Each route will call the `authProvider` with the `AUTH_GET_PERMISSIONS` type and some parameters including the current location and route parameters. It's up to you to return whatever you need to check inside your component such as the user's role, etc.

Here's an example inside a `Show` view with a `SimpleShowLayout` and a custom `actions` component:

```jsx
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { ListButton, EditButton, DeleteButton } from 'react-admin';

const cardActionStyle = {
    zIndex: 2,
    display: 'inline-block',
    float: 'right',
};

const PostShowActions = ({ permissions, basePath, data, resource }) => (
    <CardActions style={cardActionStyle}>
        <EditButton basePath={basePath} record={data} />
        <ListButton basePath={basePath} />
        {permissions === 'admin' &&
            <DeleteButton basePath={basePath} record={data} resource={resource} />
        }
    </CardActions>
);

export const PostShow = ({ permissions, ...props }) => (
    <Show actions={<PostShowActions permissions={permissions} />} {...props}>
        <SimpleShowLayout>
            <TextField source="title" />
            <RichTextField source="body" />
            {permissions === 'admin' &&
                <NumberField source="nb_views" />
            }
        </SimpleShowLayout>
    </Show>
);
```

**Tip** Note how the `permissions` prop is passed down to the custom `actions` component.

This also works inside a `TabbedShowLayout`, and you can hide a `Tab` completely:

```jsx
export const UserShow = ({ permissions, ...props }) =>
    <Show {...props}>
        <TabbedShowLayout>
            <Tab label="user.form.summary">
                {permissions === 'admin' && <TextField source="id" />}
                <TextField source="name" />
            </Tab>
            {permissions === 'admin' &&
                <Tab label="user.form.security">
                    <TextField source="role" />
                </Tab>}
        </TabbedShowLayout>
    </Show>;
```