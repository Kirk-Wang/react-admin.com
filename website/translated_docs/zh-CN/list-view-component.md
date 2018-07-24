---
layout: list-view-component
title: <List> View
---
列表视图显示从 REST API 获取的记录列表。 此视图的入口点是`<List>`组件，它负责获取数据。 然后，它将数据传递到迭代器视图-通常是 `<Datagrid`，然后将每个记录属性的渲染委托给 [`<Field>`](./Fields.html) 组件。

![The List View](https://marmelab.com/react-admin/img/list-view.png)

## `List` 组件

`<List>` 组件渲染列表布局（标题、按钮、筛选器、分页），并从 REST API 中提取记录列表。 然后将记录列表的呈现委托给其子组件。 通常，它是一个 `<Datagrid>`，负责显示一个具有每个帖子一行的表格。

**提示**：在Redux条款中，`<List>` 是一个connected组件，并且`<Datagrid>` 是一个dumb组件。

以下是通过 `<List>` 组件接受的所有属性：

- [`title`](#page-title)
- [`actions`](#actions)
- [`bulkActions`](#bulk-actions)
- [`filters`](#filters) (a React element used to display the filter form)
- [`perPage`](#records-per-page)
- [`sort`](#default-sort-field)
- [`filter`](#permanent-filter) (the permanent filter used in the REST request)
- [`filterDefaultValues`](#filter-default-values) (the default values for `alwaysOn` filters)
- [`pagination`](#pagination)

下面是显示帖子列表所需的最少代码：

```jsx
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';

import { PostList } from './posts';

const App = () => (
    <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;

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

这足以显示帖子列表：

![Simple posts list](https://marmelab.com/react-admin/img/simple-post-list.png)

### Page Title

一个列表视图的默认标题是"[resource] list"（例如："Posts list"）。使用 `title` 属性来自定义列表视图标题：

```jsx
// in src/posts.js
export const PostList = (props) => (
    <List {...props} title="List of posts">
        ...
    </List>
);
```

标题可以是任何一个字符串，或者你自己的元素。

### Actions

你可以通过你自己的元素使用 `actions` 属性替换掉默认的 action 列表： 

```jsx
import Button from '@material-ui/core/Button';
import { CardActions, CreateButton, RefreshButton } from 'react-admin';

const PostActions = ({ resource, filters, displayedFilters, filterValues, basePath, showFilter }) => (
    <CardActions>
        {filters && React.cloneElement(filters, {
            resource,
            showFilter,
            displayedFilters,
            filterValues,
            context: 'button',
        }) }
        <CreateButton basePath={basePath} />
        <RefreshButton />
        {/* Add your custom actions */}
        <Button primary onClick={customAction}>Custom Action</Button>
    </CardActions>
);

export const PostList = (props) => (
    <List {...props} actions={<PostActions />}>
        ...
    </List>
);
```

### Bulk Actions

Bulk actions 是同时影响多个记录的操作，例如大量删除。 在 `<Datagrid>` 组件中，通过勾选表格第一列中的复选框，然后从批量操作菜单中选择操作来触发批量操作。 默认情况下，所有列表视图都有一个批量操作，即批量删除操作。 您可以通过将自定义元素作为 `<List>` 组件的 bulkActions 属性传递来添加其他批量操作：

```jsx
import Button from '@material-ui/core/Button';
import { BulkActions, BulkDeleteAction } from 'react-admin';
import ResetViewsAction from './ResetViewsAction';

const PostBulkActions = props => (
    <BulkActions {...props}>
        <ResetViewsAction label="Reset Views" />
        {/* Add the default bulk delete action */}
        <BulkDeleteAction />
    </BulkActions>
);

export const PostList = (props) => (
    <List {...props} bulkActions={<PostBulkActions />}>
        ...
    </List>
);
```

**提示**：您还可以通过将 `false` 传递给 `bulkActions` 属性来完全禁用批量操作。 当在 `List` 中使用 `Datagrid` 并禁用了批量操作时，将不会添加复选框列。

React-admin 使用批量操作组件的 `label` 属性来显示批量操作菜单项。

批量操作组件是在单击相关菜单项时挂载的常规 React 组件。组件接收到几个属性，允许它执行其工作:

- `resource`: the currently displayed resource (eg `posts`, `comments`, etc.)
- `basePath`: the current router base path for the resource (eg `/posts`, `/comments`, etc.)
- `filterValues`: the filter values. This can be useful if you want to apply your action on all items matching the filter.
- `selectedIds`: the identifiers of the currently selected items.
- `onExit`: an event handler you should call when the bulk action ends.

下面是一个利用 `UPDATE_MANY` crud 操作的示例, 它将所有 posts 的 `views` 属性设置为 `0`：

```jsx
// in ./ResetViewsAction.js
import { Component } from 'react';
import { connect } from 'react-redux';
import { crudUpdateMany } from 'react-admin';

class ResetViewsAction extends Component {
    componentDidMount = () => {
        const {
            resource,
            basePath,
            selectedIds,
            onExit,
            crudUpdateMany,
        } = this.props;

        crudUpdateMany(resource, selectedIds, { views: 0 }, basePath);
        onExit();
    };

    render() {
        return null;
    }
}

export default connect(undefined, { crudUpdateMany })(ResetViewsAction);
```

此组件不呈现任何内容-它只是在挂载时 dispatch action。 完成后，它还调用由主批量操作组件传递的 `onExit()` 方法, 它具有卸载 `ResetViewsAction`组件的作用。

但大多数情况下，批量操作都是具有独立用户界面 (在对话框中) 的小型应用程序, 因此 `render ()` 方法很有用。 下面是在确认对话框后面实现的 `ResetViewsAction`：

```jsx
// in ./ResetViewsAction.js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Confirm } from 'react-admin';
import { crudUpdateMany } from 'ra-core';

class ResetViewsAction extends Component {
    handleDialogClose = () => {
        this.props.onExit();
    };

    handleConfirm = () => {
        const { basePath, crudUpdateMany, resource, selectedIds } = this.props;
        crudUpdateMany(resource, selectedIds, { views: 0 }, basePath);
        this.props.onExit();
    };

    render() {
        return (
            <Confirm
                isOpen={true}
                title="Update View Count"
                content="Are you sure you want to reset the views for these items?"
                onConfirm={this.handleConfirm}
                onClose={this.handleDialogClose}
            />
        );
    }
}

export default connect(undefined, { crudUpdateMany })(ResetViewsAction);
```

**提示**: `<Confirm>` material-ui 的 <`<Dialog>` 组件实现确认弹出菜单。请随时使用它在您的 admin 中！

**提示**：React-admin 不在内部使用 `<Confirm>` 组件，因为删除和更新会立即在本地应用，然后在几秒钟后 dispatch 到服务器，除非用户选择撤消修改。 这就是我们所谓的积极渲染。 您可以通过将 `crudUpdateMany()` 动作创建器包装在 `startUndoable()` 动作创建器中来为 `ResetViewsAction` 执行相同操作，如下所示：

```jsx
import { Component } from 'react';
import { connect } from 'react-redux';
import { startUndoable, crudUpdateMany } from 'ra-core';

class ResetViewsAction extends Component {
    componentDidMount = () => {
        const { basePath, startUndoable, resource, selectedIds } = this.props;
        startUndoable(
            crudUpdateMany(resource, selectedIds, { views: 0 }, basePath)
        );
        this.props.onExit();
    };

    render() {
        return null;
    }
}

export default connect(undefined, { startUndoable })(ResetViewsAction);
```

请注意，在这种情况下，`connect()` 的 `mapDispatchToProps` 参数中不存在 `crudUpdateMany` action 创建者。 在这种情况下，只需使用 `crudUpdateMany()` 调用的结果作为参数分发startUndoable。

### Filters

你可以使用 `filters` 属性添加一个过滤器元素到这个列表：

```jsx
const PostFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
        <TextInput label="Title" source="title" defaultValue="Hello, World!" />
    </Filter>
);

export const PostList = (props) => (
    <List {...props} filters={<PostFilter />}>
        ...
    </List>
);
```

过滤器组件必须是一个具有 `<Input>` 子级的 `<Filter>` 组件。

**提示**：`<Filter>` 是一个特殊组件, 它以两种方式呈现：

- 作为一个过滤器按钮（去添加新过滤器）
- 作为过滤器表单（去输入过滤器值）

它通过检查其 `context` 属性来进行此项检测。

**提示**：不要混淆这个 `filters` 属性，期望一个 React 元素，具有 `filter` 属性，它期望一个对象来定义永久过滤器 (见下文)。

`Filter` 组件通常接受 `className` 属性，你可以通过React-admin覆盖注入内部组件的许多类名，这得益于`classes`属性（作为大多数 Material UI 组件的属性，请参阅关于它的[文档](https://material-ui.com/customization/overrides/#overriding-with-classes)）。 此属性接受以下值：

- `form`: applied to the root element when rendering as a form.
- `button`: applied to the root element when rendering as a button.

`<Filter>` 表单的子项是常规输入。默认情况下，`<Filter>` 隐藏它们，除了那些具有 `alwaysOn` 属性的那些。

**提示**：由于技术原因，react-admin 不接受具有 `defaultValue` 和 `alwaysOn` 的 `<Filter>` 的子元素。 要为 always on 过滤器设置默认值，请使用 `<List>` 组件的 filterDefaultValues 属性（参见下文）。

### Records Per Page

默认情况下，列表为每页10条标记页码。你可以通过指定 `perPage` 属性覆写这个设置：

```jsx
// in src/posts.js
export const PostList = (props) => (
    <List {...props} perPage={25}>
        ...
    </List>
);
```

### Default Sort Field

传递一个对象字面量作为 `sort` 属性来确定用于排序的 `field` 和 `order`：

```jsx
// in src/posts.js
export const PostList = (props) => (
    <List {...props} sort={{ field: 'published_at', order: 'DESC' }}>
        ...
    </List>
);
```

`sort` 定义了 *default* 排序顺序；这个列表通过在列标题上单击保持可排序。

### Disabling Sorting

通过传递一个设置为 `false` 的 `sortable` 属性，它可能会为一个指定的字段去禁用排序：

```jsx
// in src/posts.js
import React from 'react';
import { List, Datagrid, TextField } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" sortable={false} />
            <TextField source="title" />
            <TextField source="body" />
        </Datagrid>
    </List>
);
```

### Specify Sort Field

默认情况下，列按 `source` 属性排序。若要定义要排序的其他属性，请通过 `sortBy` 属性将其设置为：

```jsx
// in src/posts.js
import React from 'react';
import { List, Datagrid, TextField } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <ReferenceField label="Post" source="id" reference="posts" sortBy="title">
                <TextField source="title" />
            </ReferenceField>
            <FunctionField
                label="Author"
                sortBy="last_name"
                render={record => `${record.author.first_name} ${record.author.last_name}`}
            />
            <TextField source="body" />
        </Datagrid>
    </List>
);
```

### Permanent Filter

您可以选择始终过滤列表，而不允许用户禁用此过滤器，例如只显示已发布的帖子。 在 `filter` 属性中写被传递到 REST client 的过滤器：

```jsx
// in src/posts.js
export const PostList = (props) => (
    <List {...props} filter={{ is_published: true }}>
        ...
    </List>
);
```

发送到 REST client 的实际过滤器参数是 *user* 过滤器（通过过滤器组件表单设置的过滤器）和永久过滤器组合的结果。 用户无法覆盖通过`filter`设置的永久过滤器。

### Filter Default Values

要将默认值设置为过滤器，您可以将对象文本作为 `<List>` 元素的filterDefaultValues 属性传递，或者使用任何输入组件的 defaultValue 属性。

有一个例外: inputs `alwaysOn` 不接受 `defaultValue`。对于那些, 您必须使用 `filterDefaultValues`。

```jsx
// in src/posts.js
const PostFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
        <BooleanInput source="is_published" alwaysOn />
        <TextInput source="title" defaultValue="Hello, World!" />
    </Filter>
);

export const PostList = (props) => (
    <List {...props} filters={<PostFilter />} filterDefaultValues={{ is_published: true }}>
        ...
    </List>
);
```

**提示**：`filter` 和 `filterDefaultValues` 属性有一个关键的区别：`filterDefaultValues` 可以由用户 overriddent, 而 `filter` 值始终发送到 data provider。 或者, 否则：

```js
const filterSentToDataProvider = { ...filterDefaultValues, ...filterChosenByUser, ...filters };
```

### Pagination

你可以通过你自己分页元素来替换默认分页元素，使用 `pagination` 属性。 分页元素接收当前页、每页记录数、记录总数,以及更改页面的 `setPage()` 函数。

因此，如果您想要通过一个"<previous - next>"分页来替换默认的分页。<previous - next>创建如下所示的页状组件：

```jsx
import Button from '@material-ui/core/Button';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Toolbar from '@material-ui/core/Toolbar';

const PostPagination = ({ page, perPage, total, setPage }) => {
    const nbPages = Math.ceil(total / perPage) || 1;
    return (
        nbPages > 1 &&
            <Toolbar>
                {page > 1 &&
                    <Button primary key="prev" icon={<ChevronLeft />} onClick={() => setPage(page - 1)}>
                        Prev
                    </Button>
                }
                {page !== nbPages &&
                    <Button primary key="next" icon={<ChevronRight />} onClick={() => setPage(page + 1)} labelPosition="before">
                        Next
                    </Button>
                }
            </Toolbar>
    );
}

export const PostList = (props) => (
    <List {...props} pagination={<PostPagination />}>
        ...
    </List>
);
```

### CSS API

`List` 组件通常接受 `className` 属性，你可以通过React-admin覆盖注入内部组件的许多类名，这得益于`classes`属性（作为大多数 Material UI 组件的属性，请参阅关于它的[文档](https://material-ui.com/customization/overrides/#overriding-with-classes)）。 此属性接受以下项：

- `root`: alternative to using `className`. Applied to the root element.
- `header`: applied to the page header
- `actions`: applied to the actions container
- `noResults`: applied to the component shown when there is no result

下面是一个如何重写这些类的示例：

通过将 `classes` 对象作为属性传递，通过 `withStyles()`，可以自定义列表样式。下面是一个示例：

```jsx
const styles = {
    header: {
        backgroundColor: '#ccc',
    },
};

const PostList = ({ classes, ...props) => (
    <List {...props} classes={{ header: classes.header }}>
        <Datagrid>
            ...
        </Datagrid>
    </List>
);

export withStyles(styles)(PostList);
```

## `Datagrid` 组件

Datagrid 组件将记录列表呈现为表表格。 它通常用作 [`<List>`](#the-list-component) 和 [`<ReferenceManyField>`](./Fields.md#referencemanyfield) 组件的子级。

以下是通过该组件接受的所有属性：

- [`rowStyle`](#row-style-function)

它会在接收 `<Field>` 子项时呈现多列。

```jsx
// in src/posts.js
import React from 'react';
import { List, Datagrid, TextField, EditButton } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="body" />
            <EditButton />
        </Datagrid>
    </List>
);
```

Datagrid是一个 *迭代器* 组件：它接收一个 id 数组和一个数据 store，并且应该迭代 id 以显示每个记录。 迭代器组件的另一个示例是 [`<SingleFieldList>`](#the-singlefieldlist-component)。

### Row Style Function

由于 `rowStyle, 您可以根据记录自定义 datagrid 行样式 (应用于 <code><tr>` 元素)</code> 属性, 它期望一个函数。

例如，如果记录的一个值（如其视图数）超过某个阈值，则允许将自定义背景应用于整行。

```jsx
const postRowStyle = (record, index) => ({
    backgroundColor: record.nb_views >= 500 ? '#efe' : 'white',
});
export const PostList = (props) => (
    <List {...props}>
        <Datagrid rowStyle={postRowStyle}>
            ...
        </Datagrid>
    </List>
);
```

### CSS API

The `Datagrid` component accepts the usual `className` prop but you can override many class names injected to the inner components by React-admin thanks to the `classes` property (as most Material UI components, see their [documentation about it](https://material-ui.com/customization/overrides/#overriding-with-classes)). This property accepts the following keys:

- `table`: alternative to using `className`. Applied to the root element.
- `tbody`: applied to the tbody
- `headerCell`: applied to each header cell
- `row`: applied to each row
- `rowEven`: applied to each even row
- `rowOdd`: applied to each odd row
- `rowCell`: applied to each row cell

Here is an example of how you can override some of these classes:

You can customize the datagrid styles by passing a `classes` object as prop, through `withStyles()`. Here is an example:

```jsx
const styles = {
    row: {
        backgroundColor: '#ccc',
    },
};

const PostList = ({ classes, ...props) => (
    <List {...props}>
        <Datagrid classes={{ row: classes.row }}>
            ...
        </Datagrid>
    </List>
);

export withStyles(styles)(PostList);
```

**Tip**: If you want to override the `header` and `cell` styles independently for each column, use the `headerClassName` and `cellClassName` props in `<Field>` components. For instance, to hide a certain column on small screens:

```jsx
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    hiddenOnSmallScreens: {
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
});

const PostList = ({ classes, ...props }) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="title" />
            <TextField
                source="views"
                headerClassName={classes.hiddenOnSmallScreens}
                cellClassName={classes.hiddenOnSmallScreens}
            />
        </Datagrid>
    </List>
);

export default withStyles(styles)(PostList);
```

## The `SimpleList` component

For mobile devices, a `<Datagrid>` is often unusable - there is simply not enough space to display several columns. The convention in that case is to use a simple list, with only one column per row. The `<SimpleList>` component serves that purpose, leveraging [material-ui's `<List>` and `<ListItem>` components](http://www.material-ui.com/#/components/list). You can use it as `<List>` or `<ReferenceManyField>` child:

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

`<SimpleList>` iterates over the list data. For each record, it executes the `primaryText`, `secondaryText`, `leftAvatar`, `leftIcon`, `rightAvatar`, and `rightIcon` props function, and passes the result as the corresponding `<ListItem>` prop.

**Tip**: To use a `<SimpleList>` on small screens and a `<Datagrid>` on larger screens, use the `<Responsive>` component:

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
                    ...
                </Datagrid>
            }
        />
    </List>
);
```

**Tip**: The `<SimpleList>` items link to the edition page by default. You can set the `linkType` prop to `show` to link to the `<Show>` page instead.

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
            linkType="show"
        />
    </List>
);
```

Setting the `linkType` prop to `false` (boolean, not string) removes the link in all list items.

## The `SingleFieldList` component

When you want to display only one property of a list of records, instead of using a `<Datagrid>`, use the `<SingleFieldList>`. It expects a single `<Field>` as child. It's especially useful for `<ReferenceManyField>` or `<ReferenceArrayField>` components:

```jsx
// Display all the tags for the current post
<ReferenceArrayField
    label="Tags"
    reference="tags"
    source="tags"
>
    <SingleFieldList>
        <ChipField source="name" />
    </SingleFieldList>
</ReferenceArrayField>
```

![ReferenceManyFieldSingleFieldList](https://marmelab.com/react-admin/img/reference-many-field-single-field-list.png)

**Tip**: The `<SingleFieldList>` items link to the edition page by default. You can set the `linkType` prop to `show` to link to the `<Show>` page instead.

```jsx
// Display all the tags for the current post
<ReferenceArrayField
    label="Tags"
    reference="tags"
    source="tags"
>
    <SingleFieldList linkType="show">
        <ChipField source="name" />
    </SingleFieldList>
</ReferenceArrayField>
```

## Using a Custom Iterator

A `<List>` can delegate to any iterator component - `<Datagrid>` is just one example. An iterator component must accept at least two props:

- `ids` is an array of the ids currently displayed in the list
- `data` is an object of all the fetched data for this resource, indexed by id.

For instance, what if you prefer to show a list of cards rather than a datagrid?

![Custom iterator](https://marmelab.com/react-admin/img/custom-iterator.png)

You'll need to create your own iterator component as follows:

```jsx
// in src/comments.js
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';

const cardStyle = {
    width: 300,
    minHeight: 300,
    margin: '0.5em',
    display: 'inline-block',
    verticalAlign: 'top'
};
const CommentGrid = ({ ids, data, basePath }) => (
    <div style={{ margin: '1em' }}>
    {ids.map(id =>
        <Card key={id} style={cardStyle}>
            <CardHeader
                title={<TextField record={data[id]} source="author.name" />}
                subheader={<DateField record={data[id]} source="created_at" />}
                avatar={<Avatar icon={<PersonIcon />} />}
            />
            <CardContent>
                <TextField record={data[id]} source="body" />
            </CardContent>
            <CardContent>
                about&nbsp;
                <ReferenceField label="Post" resource="comments" record={data[id]} source="post_id" reference="posts" basePath={basePath}>
                    <TextField source="title" />
                </ReferenceField>
            </CardContent>
            <CardActions style={{ textAlign: 'right' }}>
                <EditButton resource="posts" basePath={basePath} record={data[id]} />
            </CardActions>
        </Card>
    )}
    </div>
);
CommentGrid.defaultProps = {
    data: {},
    ids: [],
};

export const CommentList = (props) => (
    <List title="All comments" {...props}>
        <CommentGrid />
    </List>
);
```

As you can see, nothing prevents you from using `<Field>` components inside your own components... provided you inject the current `record`. Also, notice that components building links require the `basePath` component, which is also injected.

## Displaying Fields depending on the user permissions

You might want to display some fields or filters only to users with specific permissions. Those permissions are retrieved for each route and will provided to your component as a `permissions` prop.

Each route will call the `authProvider` with the `AUTH_GET_PERMISSIONS` type and some parameters including the current location and route parameters. It's up to you to return whatever you need to check inside your component such as the user's role, etc.

```jsx
const UserFilter = ({ permissions, ...props }) =>
    <Filter {...props}>
        <TextInput
            label="user.list.search"
            source="q"
            alwaysOn
        />
        <TextInput source="name" />
        {permissions === 'admin' ? <TextInput source="role" /> : null}
    </Filter>;

export const UserList = ({ permissions, ...props }) =>
    <List
        {...props}
        filters={<UserFilter permissions={permissions} />}
        sort={{ field: 'name', order: 'ASC' }}
    >
        <Responsive
            small={
                <SimpleList
                    primaryText={record => record.name}
                    secondaryText={record =>
                        permissions === 'admin' ? record.role : null}
                />
            }
            medium={
                <Datagrid>
                    <TextField source="id" />
                    <TextField source="name" />
                    {permissions === 'admin' && <TextField source="role" />}
                    {permissions === 'admin' && <EditButton />}
                    <ShowButton />
                </Datagrid>
            }
        />
    </List>;
```

**Tip** Note how the `permissions` prop is passed down to the custom `filters` component.