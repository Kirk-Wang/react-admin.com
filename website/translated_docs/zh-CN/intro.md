---
id: intro
title: 简介
---
一个运行在浏览器中，在REST/GraphQL API之上，用于构建admin（中后台）应用程序的前端框架。它使用了ES6，[React](https://facebook.github.io/react/) 和 [Material Design](https://material.io/)进行编写。 它以前的名字叫做 [admin-on-rest](https://github.com/marmelab/admin-on-rest)。 由[marmelab](https://marmelab.com/)开源和维护。

[Demo](https://marmelab.com/react-admin-demo/) - [Source](https://github.com/marmelab/react-admin) - [Releases](https://github.com/marmelab/react-admin/releases) - [Support](http://stackoverflow.com/questions/tagged/react-admin) <iframe src="https://player.vimeo.com/video/268958716?byline=0&portrait=0" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="display:block;margin:0 auto" mark="crwd-mark"></iframe> 

## 功能

* 适配任何后端接口架构 （REST，GraphQL，SOAP等）
* 完善的使用文档
* Super-fast（超快的）UI 得益于optimistic （积极的）渲染 (在服务器返回之前呈现)
* 超快的撤消更新和删除
* 支持关联（多对一，一对多）
* 国际化 （i18n）
* 条件格式化
* 主题化（可更换的主题）
* 支持任何身份验证提供程序（REST API，OAuth，Basic Auth，...）
* 功能全面的数据表格（排序，分页，过滤器）
* 输入即筛选
* 支持任何表单布局 (简单、选项卡式等)
* 数据验证
* 自定义action
* 用于各种数据类型的大型组件库: boolean, number, rich text等。
* 所见即所得（WYSIWYG）编辑器
* 可自定义仪表板、菜单、版式
* 超容易扩展和覆写 (它仅仅只是React组件)
* 高度可定制的界面
* 可以连接到多个后端
* 使用了React生态系统中最好的库（Redux，redux-form，redux-saga，material-ui，recompose）
* 可以包含在另一个React应用程序
* 受流行库 \[ng-admin\](https://github.com/marmelab/ng-admin) 的启发 （ng-admin 也是由marmelab开源和维护）

## 安装

React-admin 可以从npm获得并安装（和它所必需的依赖） 使用：

```sh
npm install react-admin
```

## 用法

阅读大约15分钟的 [教程](./Tutorial.md)介绍。 之后，前往\[文档\](./index.html)，或查看\[演示的源代码\](https://github.com/marmelab/react-admin/tree/master/examples/demo)以便获取示例用法。

## 一目了然

```jsx
// in app.js
import React from 'react';
import { render } from 'react-dom';
import { Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

import { PostList, PostEdit, PostCreate, PostIcon } from './posts';

render(
    <Admin dataProvider={simpleRestProvider('http://localhost:3000')}>
        <Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} icon={PostIcon}/>
    </Admin>,
    document.getElementById('root')
);
```

`<Resource>` 组件是一个配置组件，它允许你为每个admin视图定义子组件： `list`，`edit`和`create`。 这些组件使用来自于react-admin中的 Material UI 和 定制组件：

```jsx
// in posts.js
import React from 'react';
import { List, Datagrid, Edit, Create, SimpleForm, DateField, TextField, EditButton, DisabledInput, TextInput, LongTextInput, DateInput } from 'react-admin';
import BookIcon from '@material-ui/icons/Book';
export const PostIcon = BookIcon;

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="title" />
            <DateField source="published_at" />
            <TextField source="average_note" />
            <TextField source="views" />
            <EditButton basePath="/posts" />
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
            <TextInput source="title" />
            <TextInput source="teaser" options={{ multiLine: true }} />
            <LongTextInput source="body" />
            <DateInput label="Publication date" source="published_at" />
            <TextInput source="average_note" />
            <DisabledInput label="Nb views" source="views" />
        </SimpleForm>
    </Edit>
);

export const PostCreate = (props) => (
    <Create title="Create a Post" {...props}>
        <SimpleForm>
            <TextInput source="title" />
            <TextInput source="teaser" options={{ multiLine: true }} />
            <LongTextInput source="body" />
            <TextInput label="Publication date" source="published_at" />
            <TextInput source="average_note" />
        </SimpleForm>
    </Create>
);
```

## 它是否适用于我的API？

Yes.

React-admin使用适配器方法，其概念称为Data Providers（数据提供者）。 现有数据提供程序（Data Provider）可以用作blueprint来设计你的 API， 也可以编写自己的数据提供程序（Provider）来查询现有的 api。 Writing a custom Data Provider is a matter of hours.

![Data Provider architecture](https://marmelab.com/react-admin/img/data-provider.png)

有关详细信息, 请参阅 [数据提供程序文档](./DataProviders.md)。

## 包含电池但可拆装

React-admin 在\[material-ui\](http://www.material-ui.com/#/)之上被设计为一个松散合的React组件库，除了控制器功能实现了Redux方法以外。 它也非常容易用你自己的方法来替换react-admin的某一部分，例如，去自定义datagrid，GraphQL代替REST，或者bootstrap代替Material Design。

## 贡献

欢迎所有在 [GitHub repository](https://github.com/marmelab/react-admin)上的PR。 尝试遵循现有文件的编码风格，并包括单元测试和文档。 为全面的代码审查做好准备，并且对合并要有耐心 - 这是一项开源的倡议。

您可以运行这个示例应用程序通过调用：

```sh
make run
```

然后浏览 <http://localhost:8080/>。

如果你想贡献文档， 安装jekyll， 然后调用

```sh
make doc
```

然后浏览 <http://localhost:4000/>

你可您可以运行单元测试通过调用

```sh
make test
```

如果你正使用react-admin作为依赖项，并且如果您想尝试并hack它，下面是建议的过程：

```sh
# in myapp
# install react-admin from GitHub in another directory
$ cd ..
$ git clone git@github.com:marmelab/react-admin.git && cd react-admin && make install
# replace your node_modules/react-admin by a symbolic link to the github checkout
$ cd ../myapp
$ npm link ../react-admin
# go back to the checkout, and replace the version of react by the one in your app
$ cd ../react-admin
$ npm link ../myapp/node_modules/react
$ make watch
# in another terminal, go back to your app, and start it as usual
$ cd ../myapp
$ npm run
```

## 许可

React-admin遵循 [MIT Licence](https://github.com/marmelab/react-admin/blob/master/LICENSE.md)，由 [marmelab](http://marmelab.com)赞助和支持。

## 捐赠

这个库是免费使用的，即使是商业用途。 如果你想要回馈，请交流它，帮助新人，或贡献代码。 但是, 最好的方法是 **捐赠慈善机构**。 我们推荐[Doctors Without Borders](http://www.doctorswithoutborders.org/)。