---
id: intro
title: 简介
---
一个运行在浏览器中，在REST/GraphQL API之上，用于构建admin（中后台）应用程序的前端框架。它使用了ES6，[React](https://facebook.github.io/react/) 和 [Material Design](https://material.io/)进行编写。 它以前的名字叫做 [admin-on-rest](https://github.com/marmelab/admin-on-rest)。 由[marmelab](https://marmelab.com/)开源和维护。

[Demo](https://marmelab.com/react-admin-demo/) - [Source](https://github.com/marmelab/react-admin) - [Releases](https://github.com/marmelab/react-admin/releases) - [Support](http://stackoverflow.com/questions/tagged/react-admin) <iframe src="https://player.vimeo.com/video/268958716?byline=0&portrait=0" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="display:block;margin:0 auto" mark="crwd-mark"></iframe> 

## 功能

* 适配任何后端接口架构（REST，GraphQL，SOAP等）
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

## Usage

Read the [Tutorial](./Tutorial.md) for a 15 minutes introduction. After that, head to the [Documentation](./index.md), or checkout the [source code of the demo](https://github.com/marmelab/react-admin/tree/master/examples/demo) for an example usage.

## At a Glance

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

The `<Resource>` component is a configuration component that allows to define sub components for each of the admin view: `list`, `edit`, and `create`. These components use Material UI and custom components from react-admin:

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

## Does It Work With My API?

Yes.

React-admin uses an adapter approach, with a concept called *Data Providers*. Existing providers can be used as a blueprint to design your API, or you can write your own Data Provider to query an existing API. Writing a custom Data Provider is a matter of hours.

![Data Provider architecture](https://marmelab.com/react-admin/img/data-provider.png)

See the [Data Providers documentation](./DataProviders.md) for details.

## Batteries Included But Removable

React-admin is designed as a library of loosely coupled React components built on top of [material-ui](http://www.material-ui.com/#/), in addition to controller functions implemented the Redux way. It is very easy to replace one part of react-admin with your own, e.g. to use a custom datagrid, GraphQL instead of REST, or bootstrap instead of Material Design.

## Contributing

Pull requests are welcome on the [GitHub repository](https://github.com/marmelab/react-admin). Try to follow the coding style of the existing files, and include unit tests and documentation. Be prepared for a thorough code review, and be patient for the merge - this is an open-source initiative.

You can run the example app by calling:

```sh
make run
```

And then browse to <http://localhost:8080/>.

If you want to contribute to the documentation, install jekyll, then call

```sh
make doc
```

And then browse to <http://localhost:4000/>

You can run the unit tests by calling

```sh
make test
```

If you are using react-admin as a dependency, and if you want to try and hack it, here is the advised process:

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

## License

React-admin is licensed under the [MIT Licence](https://github.com/marmelab/react-admin/blob/master/LICENSE.md), sponsored and supported by [marmelab](http://marmelab.com).

## Donate

This library is free to use, even for commercial purpose. If you want to give back, please talk about it, help newcomers, or contribute code. But the best way to give back is to **donate to a charity**. We recommend [Doctors Without Borders](http://www.doctorswithoutborders.org/).