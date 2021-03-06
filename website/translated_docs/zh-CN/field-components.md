---
layout: field-components
title: Field 组件
---
`Field` 组件显示 REST 资源的给定属性。 此类组件在 `List` 视图中使用，但也可以针对只读字段在 `Edit` 和` Create` 视图中使用。 所有 Field 组件中最常见的是 `<TextField>`:

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

所有字段组件都接受以下属性：

- `source`: Property name of your entity to view/edit. This attribute is required.
- `label`: Used as a table header of an input label. Defaults to the `source` when omitted.
- `sortable`: Should the list be sortable using `source` attribute? Defaults to `true`.
- `className`: A class name (usually generated by JSS) to customize the look and feel of the field element itself
- `cellClassName`: A class name (usually generated by JSS) to customize the look and feel of the field container (e.g. the `<td>` in a datagrid).
- `headerClassName`: A class name (usually generated by JSS) to customize the look and feel of the field header (e.g. the `<th>` in a datagrid).
- `addLabel`: Defines the visibility of the label when the field is not in a datagrid. Default value is ```true```.
- `textAlign`: Defines the text alignment inside a cell. Supports `left` (the default) and `right`.

```jsx
<TextField source="zb_title" label="Title" style={{ color: 'purple' }} />
```

**提示**：您也可以在 `Edit` 或 `Show` 视图中使用 Field 组件：

```jsx
export const PostShow = ({ ...props }) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="title" />
        </SimpleShowLayout>
    </Show>
);
```

**提示**：如果显示具有复杂结构的记录，则可以使用带有点分隔符的路径作为 `source` 属性。 例如，如果API返回以下'book'记录：

```jsx
{
    id: 1234,
    title: 'War and Peace',
    author: {
        firstName: 'Leo',
        lastName: 'Tolstoi'
    }
}
```

然后可以显示作者名字如下：

```jsx
<TextField source="author.firstName" />
```

**提示**：如果要根据该值格式化字段，请使用高阶组件执行条件格式设置，如[ Theming documentation ](./Theming.md#conditional-formatting)中所述。

**提示**：如果你的界面必须支持多种语言，请勿使用 `label`，放本地化标签在字典中代替它。 有关详细信息, 请参阅 [身份验证文档](./Translation.md#translating-resource-and-field-names)。

## `ArrayField` 组件

使用 `<Field>` 子组件显示一个集合。

非常适合嵌入式对象数组，例如： 以下` post `对象中的 `tags` 和 `backlinks`：

```js
{
  id: 123
  tags: [
        { name: 'foo' },
        { name: 'bar' }
  ],
  backlinks: [
        {
            date: '2012-08-10T00:00:00.000Z',
            url: 'http://example.com/foo/bar.html',
        },
        {
            date: '2012-08-14T00:00:00.000Z',
            url: 'https://blog.johndoe.com/2012/08/12/foobar.html',
        }
   ]
}
```

该子级必须是迭代器组件 (如 `<Datagrid>` 或 `<SingleFieldList>`)。

以下是如何将当前 post 的所有 backlinks 显示为 `<datagrid>`

```jsx
<ArrayField source="backlinks">
    <Datagrid>
        <DateField source="date" />
        <UrlField source="url" />
    </Datagrid>
</ArrayField>
```

下面是如何将当前 post 的所有 tag 显示为 `<Chip>` 组件:

```jsx
<ArrayField source="tags">
    <SingleFieldList>
        <ChipField source="name" />
    </SingleFieldList>
</ArrayField>
```

**提示**：如果需要以自定义方式呈现集合，则编写自己的组件通常比较简单：

```jsx
const TagsField = ({ record }) => (
    <ul>
        {record.tags.map(item => (
            <li key={item.name}>{item.name}</li>
        ))}
    </ul>
)
TagsField.defaultProps = { addLabel: true };
```

## `BooleanField` 组件

将布尔值显示为 check 。

```jsx
import { BooleanField } from 'react-admin';

<BooleanField source="commentable" />
```

![BooleanField](https://marmelab.com/react-admin/img/boolean-field.png)

## `ChipField` 组件

在 ["Chip"](http://www.material-ui.com/#/components/chip)中显示一个值, 它是 label 的 Material UI 术语。

```jsx
import { ChipField } from 'react-admin';

<ChipField source="category" />
```

![ChipField](https://marmelab.com/react-admin/img/chip-field.png)

该字段类型对于一对多关系特别有用，例如， 显示给定作者的书籍列表：

```jsx
import { ChipField, SingleFieldList, ReferenceManyField } from 'react-admin';

<ReferenceManyField reference="books" target="author_id">
    <SingleFieldList>
        <ChipField source="title" />
    </SingleFieldList>
</ReferenceManyField>
```

## `DateField` 组件

使用浏览器 locale 显示一个日期或日期时间（得益于 `Date.toLocaleDateString()` 和 `Date.toLocaleString()`）。

```jsx
import { DateField } from 'react-admin';

<DateField source="publication_date" />
```

此组件接受一个 `showTime` 属性（默认为false），以强制显示除日期之外的时间。 它使用 `Intl.DateTimeFormat()` 如果可用，传递 `locales` 和 `options` 属性作为参数。 如果 Intl 不可用，它将忽略 `locales` 和 `options` 属性。

```jsx
<DateField source="publication_date" />
// renders the record { id: 1234, publication_date: new Date('2017-04-23') } as
<span>4/23/2017</span>

<DateField source="publication_date" showTime />
// renders the record { id: 1234, publication_date: new Date('2017-04-23 23:05') } as
<span>4/23/2017, 11:05:00 PM</span>

<DateField source="publication_date" options={{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }} />
// renders the record { id: 1234, publication_date: new Date('2017-04-23') } as
<span>Sunday, April 23, 2017</span>

<DateField source="publication_date" locales="fr-FR" />
// renders the record { id: 1234, publication_date: new Date('2017-04-23') } as
<span>23/04/2017</span>

<DateField source="publication_date" elStyle={{ color: 'red' }} />
// renders the record { id: 1234, publication_date: new Date('2017-04-23') } as
<span style="color:red;">4/23/2017</span>
```

有关 `options` 属性语法，请参阅 [Intl.DateTimeformat documentation](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Date/toLocaleDateString)

** 提示 **：如果您需要比 `Intl.DateTimeformat` 可提供更多的格式化选项，利用一个第三方库如 [moment.js](http://momentjs.com/) 构建你自己的字段组件。

## `EmailField` 组件

`<EmailField>` 将电子邮件显示为 `<a href="mailto:" />` 链接。

```jsx
import { EmailField } from 'react-admin';

<EmailField source="personal_email" />
```

## `FunctionField` 组件

如果你需要一个特殊的函数来渲染一个字段，那么 `<FunctionField>` 就是完美的匹配。 它将 `record` 传递给通过开发人员提供的一个 `render` 函数。 例如，要显示基于 `first_name` 和 `last_name` 属性的 ` user `记录的全名：

```jsx
import { FunctionField } from 'react-admin'

<FunctionField label="Name" render={record => `${record.first_name} ${record.last_name}`} />
```

**提示**：从技术上讲，由于您提供了渲染函数，因此您可以省略`<FunctionField>` 的 `source` 属性。 但是，提供 `source` 或 `sortBy` 将允许 datagrid 使列可排序，因为当用户单击列时，datagrid使用这些属性进行排序。 如果同时提供两者，`sortBy` 将覆盖用于对列进行排序的 `source`。

## `ImageField` 组件

如果需要显示 API 提供的 image，你可以使用 `<ImageField />` 组件：

```jsx
import { ImageField } from 'react-admin';

<ImageField source="url" title="title" />
```

这个 Field 也通常用在一个 [`<ImageInput />`](http://marmelab.com/react-admin/Inputs.md#imageinput) 组件内来显示预览。

可选的 `title` 属性指向图片标题属性，用于 `alt` 和 `title` 属性。 它可以是一个硬编码的字符串，也可以是在你JSON对象内的路径：

```jsx
// { picture: { url: 'cover.jpg', title: 'Larry Cover (French pun intended)' } }

// Title would be "picture.title", hence "Larry Cover (French pun intended)"
<ImageField source="picture.url" title="picture.title" />

// Title would be "Picture", as "Picture" is not a path in previous given object
<ImageField source="picture.url" title="Picture" />
```

如果传递的值是在你 JSON 对象内的现有路径，那么它将使用 object 属性。否则，它将其值视为一个硬编码的标题。

如果该记录实际上包含一个由 `source` 属性定义在它属性中的图片数组，则需要 `src` 属性来确定图像的 `src` 值，例如：

```js
// This is the record
{
    pictures: [
        { url: 'image1.jpg', desc: 'First image' },
        { url: 'image2.jpg', desc: 'Second image' },
    ],
}

<ImageField source="pictures" src="url" title="desc" />
```

## `FileField` 组件

如果需要显示 API 提供的文件，可以使用 `<FileField />` 组件：

```jsx
import { FileField } from 'react-admin';

<FileField source="url" title="title" />
```

这个 Field 也通常用在一个 [`<FileInput />`](http://marmelab.com/react-admin/Inputs.md#fileinput) 组件内来显示预览。

可选的 `title` 属性指向文件标题属性，用于 `title` 属性。 它可以是一个硬编码的字符串，也可以是你JSON对象中的路径：

```jsx
// { file: { url: 'doc.pdf', title: 'Presentation' } }

// Title would be "file.title", hence "Presentation"
<FileField source="file.url" title="file.title" />

// Title would be "File", as "File" is not a path in previous given object
<FileField source="file.url" title="File" />
```

如果传递的值是在你 JSON 对象内的现有路径，那么它将使用 object 属性。否则，它将其值视为一个硬编码的标题。

如果该记录实际上包含一个由 `source` 属性定义在它属性中的文件数组，则需要 `src` 属性来确定图像的 `href` 值，例如：

```js
// This is the record
{
    files: [
        { url: 'image1.jpg', desc: 'First image' },
        { url: 'image2.jpg', desc: 'Second image' },
    ],
}

<FileField source="files" src="url" title="desc" />
```

您可以选择设置`target`属性，以选择链接尝试打开的窗口。

```jsx
// Will make the file open in new window
<FileField source="file.url" target="_blank" />
```

## `NumberField` 组件

显示根据浏览器区域设置格式化的数字，右对齐。

使用 `Intl.NumberFormat()` 如果可用，传递 `locales` 和 `options` 属性作为参数。 这允许完美显示小数，货币，百分比等。

如果Intl不可用，它会按原样输出数字（并忽略 `locales` 和 `options` 属性）。

```jsx
import { NumberField }  from 'react-admin';

<NumberField source="score" />
// renders the record { id: 1234, score: 567 } as
<span>567</span>

<NumberField source="score" options={{ maximumFractionDigits: 2 }}/>
// renders the record { id: 1234, score: 567.3567458569 } as
<span>567.35</span>

<NumberField source="share" options={{ style: 'percent' }} />
// renders the record { id: 1234, share: 0.2545 } as
<span>25%</span>

<NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
// renders the record { id: 1234, price: 25.99 } as
<span>$25.99</span>

<NumberField source="price" locales="fr-FR" options={{ style: 'currency', currency: 'USD' }} />
// renders the record { id: 1234, price: 25.99 } as
<span>25,99 $US</span>

<NumberField source="score" elStyle={{ color: 'red' }} />
// renders the record { id: 1234, score: 567 } as
<span style="color:red;">567</span>
```

有关 `options` 属性语法，请参阅 [ Intl.Numberformat documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)

**提示**：如果您需要比 Intl.Numberformat 可以提供更多的格式化选项，使用像 [numeral.js](http://numeraljs.com/) 一个第三方库构建你自己的field组件。

**提示**：当在 `Show` 视图中使用时, 右对齐可能看起来很怪异。通过重置 `style` 属性禁用它：

```jsx
import { NumberField }  from 'react-admin';

<NumberField source="score" style={{}} />
```

## `SelectField` 组件

当需要显示枚举字段时, `<SelectField>` 将该值映射到字符串。

例如, 如果 `gender` 字段可以取值 "M" 和 "F"，下面是如何将其显示为 "Male" 或 "Female"：

```jsx
import { SelectField } from 'react-admin';

<SelectField source="gender" choices={[
   { id: 'M', name: 'Male' },
   { id: 'F', name: 'Female' },
]} />
```

默认情况下，文本构建通过

- 查找 "id" 属性等于字段值的选项
- 使用'name'属性作为一个选项文本

**警告**： 如果同时导入这两个，此组件名称可能与 material-ui 的 [`<SelectField>`](http://www.material-ui.com/#/components/select-field) 冲突。

还可以自定义用于查找值和文本的属性, 这要归功于 "optionValue" 和 "optionText" 属性。

```jsx
const choices = [
   { _id: 123, full_name: 'Leo Tolstoi', sex: 'M' },
   { _id: 456, full_name: 'Jane Austen', sex: 'F' },
];
<SelectField source="author_id" choices={choices} optionText="full_name" optionValue="_id" />
```

`optionText` 也接受一个函数，所以你可以随意设置选项文本：

```jsx
const choices = [
   { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
   { id: 456, first_name: 'Jane', last_name: 'Austen' },
];
const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
<SelectField source="author_id" choices={choices} optionText={optionRenderer} />
```

`optionText` 也接受一个 Reac t元素，它将被克隆，并接收相关选择作为`record` 属性。您可以在那里使用 Field 组件。

```jsx
const choices = [
   { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
   { id: 456, first_name: 'Jane', last_name: 'Austen' },
];
const FullNameField = ({ record }) => <Chip>{record.first_name} {record.last_name}</Chip>;
<SelectField source="gender" choices={choices} optionText={<FullNameField />}/>
```

默认情况下翻译当前选项，因此您可以使用翻译标识符作为选择：

```jsx
const choices = [
   { id: 'M', name: 'myroot.gender.male' },
   { id: 'F', name: 'myroot.gender.female' },
];
```

然而，在某些情况下（例如在 `<ReferenceField>` 内），您可能不希望翻译该选择。在这种情况下，请将 `translateChoice` 属性设置为false。

```jsx
<SelectField source="gender" choices={choices} translateChoice={false}/>
```

**提示**： <referencefield> 默认情况下, 将 `translateChoice` 设置为 false。

## `ReferenceField` 组件

此组件提取单个引用的记录 (使用 `GET_MANY` REST 方法)，并显示此记录的一个字段。 这就是为什么 `<ReferenceField>` 必须始终有一个子 `<Field>` 的原因。

例如，这里是如何获取与 `post` 相关的 `user` 记录，并显示每个的 `name`：

```jsx
import React from 'react';
import { List, Datagrid, ReferenceField, TextField } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <ReferenceField label="Author" source="user_id" reference="users">
                <TextField source="name" />
            </ReferenceField>
        </Datagrid>
    </List>
);
```

使用此配置，`<ReferenceField>` 将用户的名称包装到相关用户 `<Edit>` 页的链接中。

![ReferenceField](https://marmelab.com/react-admin/img/reference-field.png)

`<ReferenceField>` 接受一个 `reference` 属性，它指定为相关记录获取资源。 此外，您可以使用任何 `Field` 组件作为子级。

**注释**: 您 **必须** 添加 `<Resource>` 对于 reference resource - react-admin 需要它来获取引用数据。 如果你想在侧边栏菜单中隐藏它，你 *可以* 省略此引用中的 `list` 属性。

```jsx
<Admin dataProvider={myDataProvider}>
    <Resource name="comments" list={CommentList} />
    <Resource name="posts" />
</Admin>
```

要将链接从 `<Edit>` 页更改为 `<Show>` 页， 将 `linkType` 属性设置为 "show"。

```jsx
<ReferenceField label="User" source="userId" reference="users" linkType="show">
    <TextField source="name" />
</ReferenceField>
```

默认情况下，`<ReferenceField>` 按其 `source` 排序。 要指定要排序的其他属性，请将 `sortBy` 属性设置为相应属性的名称。

```jsx
<ReferenceField label="User" source="userId" reference="users" sortBy="user.name">
    <TextField source="name" />
</ReferenceField>
```

你也可以通过将 `linkType` 设置为 `false` 来阻止 `<ReferenceField>` 添加链接到子级。

```jsx
// No link
<ReferenceField label="User" source="userId" reference="users" linkType={false}>
    <TextField source="name" />
</ReferenceField>
```

**提示**：React-admin 使用 `CRUD_GET_ONE_REFERENCE` action 来累积和重复数据删除引用记录的 ID，以便对整个列表进行一次 `GET_MANY` 调用，而不是 n 次 `GET_ONE` 调用。 如果这个API返回下面的评论列表：

```jsx
[
    {
        id: 123,
        body: 'Totally agree',
        post_id: 789,
    },
    {
        id: 124,
        title: 'You are right my friend',
        post_id: 789
    },
    {
        id: 125,
        title: 'Not sure about this one',
        post_id: 735
    }
]
```

然后 react-admin 使用 `<ReferenceField>` loader 渲染 `<CommentList>`，在一次调用（`GET http://path.to.my.api/posts?ids=[789,735]`）中获取相关帖子的API，并在数据到达后重新呈现列表。 这加速了渲染，并最大限度地减少了网络负载。

## `ReferenceManyField` 组件

该组件通过在其他资源（使用 `GET_MANY_REFERENCE` REST方法）中反向查找当前的 `record.id` 来获取引用的记录列表。 另一资源中当前记录的 id 的字段名由所需的 `target` 字段指定。 然后将结果传递给迭代器组件（如 `<SingleFieldList>` 或 `<Datagrid>` ）。 迭代器组件通常具有一个或更多子 `<Field>` 组件。

例如，这里是如何通过将 `comment.post_id` 匹配到 `post.id` 来获取与 `post` 记录相关的 `comments`，然后在 `<ChipField>` 中显示 `author.name`：

```jsx
import React from 'react';
import { List, Datagrid, ChipField, ReferenceManyField, SingleFieldList, TextField } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="title" type="email" />
            <ReferenceManyField label="Comments by" reference="comments" target="post_id">
                <SingleFieldList>
                    <ChipField source="author.name" />
                </SingleFieldList>
            </ReferenceManyField>
            <EditButton />
        </Datagrid>
    </List>
);
```

![ReferenceManyFieldSingleFieldList](https://marmelab.com/react-admin/img/reference-many-field-single-field-list.png)

`<ReferenceManyField>`接受一个 `reference` 属性，它指定获取相关记录的资源。 它还接受` source `属性，该属性定义包含要在引用资源的` target </ code>字段中查找的值的字段。 默认情况下, 这是资源的 <code>id` (`post. id` 在上一个示例中)。

**注释**：您 **必须** 添加 `<Resource>` 对于 reference resource - react-admin 需要它来获取引用数据。 如果你想在侧边栏菜单中隐藏它，你 *可以* 省略此引用中的 `list` 属性。

您可以使用 `<Datagrid>` 而不是 `<SingleFieldList>` - 但不能在另一个 `<Datagrid>` 内！ 如果要显示相关记录的只读列表，这很有用。 例如，如果要在帖子的 `<Edit>` 视图中显示与 `post` 相关的`comments`：

```jsx
import React from 'react';
import { Edit, Datagrid, SimpleForm, DisabledInput, DateField, EditButton, ReferenceManyField, TextField, TextInput } from 'react-admin';

export const PostEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput source="title" />
            <ReferenceManyField
                label="Comments"
                reference="comments"
                target="post_id"
            >
                <Datagrid>
                    <DateField source="created_at" />
                    <TextField source="author.name" />
                    <TextField source="body" />
                    <EditButton />
                </Datagrid>
            </ReferenceManyField>
        </SimpleForm>
    </Edit>
);
```

![ReferenceManyFieldDatagrid](https://marmelab.com/react-admin/img/reference-many-field-datagrid.png)

默认情况下，react-admin 将可能的值限制为 25。您可以通过设置 `perPage` 属性来更改此限制。

```jsx
<ReferenceManyField perPage={10} reference="comments" target="post_id">
   ...
</ReferenceManyField>
```

默认情况下，它通过 id desc 排序可能的值。 您可以通过设置 `sort` 属性（具有 `field` 和 `order` 属性的对象）来更改此顺序。

```jsx
<ReferenceManyField sort={{ field: 'created_at', order: 'DESC' }} reference="comments" target="post_id">
   ...
</ReferenceManyField>
```

此外，您还可以过滤用于填充可能值的查询。使用 `filter` 属性。

```jsx
<ReferenceManyField filter={{ is_published: true }} reference="comments" target="post_id">
   ...
</ReferenceManyField>
```

## `ReferenceArrayField` 组件

使用 `<ReferenceArrayField>` 来显示基于外键数组的引用值列表。

例如, 如果 post 有许多 tag, 则 post 资源可能类似于：

```js
{
    id: 1234,
    title: 'Lorem Ipsum',
    tag_ids: [1, 23, 4]
}
```

其中 `[1, 23, 4]` 引用 `tag` 资源的 id。

`<ReferenceArrayField>` 可以通过将 `post.tag_ids` 匹配到 `tag.id` 来获取与这个 `post` 资源相关的 `tag` 资源。 `<ReferenceArrayField source="tags_ids" reference="tags">` 将发出一个 HTTP 请求, 其样子如下：

    http://myapi.com/tags?id=[1,23,4]
    

**提示**：`<ReferenceArrayField>` 使用 `GET_MANY` REST 方法获取相关资源，所以实际的 HTTP 请求取决于你的REST客户端。

一旦接收到相关的资源， `<ReferenceArrayField>` 使用 `ids` 和 `data` 属性传递它们给它的子组件，所以子级必须是一个迭代器组件（如 `<SingleFieldList>` 或 `<Datagrid>`）。 迭代器组件通常具有一个或多个子 `<Field>` 组件。

以下是如何获取 `PostList` 中每个帖子的标签列表，并在`<ChipField>` 中显示每个 `tag` 的 `name`：

```jsx
import React from 'react';
import { List, Datagrid, ChipField, ReferenceArrayField, SingleFieldList, TextField } from 'react-admin';

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="title" />
            <ReferenceArrayField label="Tags" reference="tags" source="tag_ids">
                <SingleFieldList>
                    <ChipField source="name" />
                </SingleFieldList>
            </ReferenceArrayField>
            <EditButton />
        </Datagrid>
    </List>
);
```

**注意**：您**必须**为引用资源添加一个`<Resource>` 组件到您的 `<Admin>` 组件，因为 react-admin 需要它来获取引用数据。 如果您不想在侧边栏菜单中显示一个条目给它，你可以在此资源中省略 `list` 属性。

```jsx
export const App = () => (
    <Admin dataProvider={restProvider('http://path.to.my.api')}>
        <Resource name="posts" list={PostList} />
        <Resource name="tags" /> // <= this one is compulsory
    </Admin>
);
```

在 "显示" 视图的编辑中, 可以将 `<ReferenceArrayField>` 与 `<Datagrid> `合并在一起 显示表中的相关资源。 例如, 要在 `PostShow` 视图中显示与 post 相关的标记的详细信息, 请执行以下操作：

```jsx
import React from 'react';
import { Show, SimpleShowLayout, TextField, ReferenceArrayField, Datagrid, ShowButton } from 'react-admin';

export const PostShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="title" />
            <ReferenceArrayField label="Tags" reference="tags" source="tag_ids">
                <Datagrid>
                    <TextField source="id" />
                    <TextField source="name" />
                    <ShowButton />
                </Datagrid>
            </ReferenceArrayField>
            <EditButton />
        </SimpleShowLayout>
    </Show>
);
```

## `RichTextField` 组件

此组件显示一些HTML内容。 内容默认为“丰富”（即未转义）。

```jsx
import { RichTextField } from 'react-admin';

<RichTextField source="body" />
```

![RichTextField](https://marmelab.com/react-admin/img/rich-text-field.png)

` stripTags `属性（默认情况下为` false `）允许您删除任何HTML标记，从而防止出现一些显示毛刺（这在列表视图中尤其有用）。

```jsx
import { RichTextField } from 'react-admin';

<RichTextField source="body" stripTags />
```

## `TextField` 组件

最简单的作为所有字段，`<TextField>` 只是将记录属性显示为纯文本。

```jsx
import { TextField } from 'react-admin';

<TextField label="Author Name" source="name" />
```

## `UrlField` 组件

`<UrlField>` 在`< a href="">` 标签中显示一个url。

```jsx
import { UrlField } from 'react-admin';

<UrlField source="site_url" />
```

## Styling Fields

所有 field 组件都接受 `className` 属性, 允许您根据自己的喜好自定义其样式。 我们建议您使用Material UI样式解决方案，JSS来生成这些类。 请参阅他们的[文档](https://material-ui.com/customization/css-in-js/#api)。

```jsx
import { withStyles } from '@material-ui/core/styles';

const styles = {
    price: { color: 'purple' },
};

const PriceField = withStyles(styles)(({ classes, ...props }) => (
    <TextField className={classes.price} {...props} />
));

export const ProductList = (props) => (
    <List {...props}>
        <Datagrid>
            <PriceField source="price" />
        </Datagrid>
    </List>
);

// renders in the datagrid as
<td><span class="[class name generated by JSS]">2</span></td>
```

React-admin 通常将 field 组件的呈现委托给 material-ui 组件。请参阅material-ui文档以查看元素的默认样式。

您可能需要自定义 `DataGrid` 内的单元格样式。可以使用 `cellClassName` 进行以下操作：

```jsx
import { withStyles } from '@material-ui/core/styles';

const styles = {
    priceCell: { fontWeight: 'bold' },
};

const PriceField = withStyles(styles)(({ classes, ...props }) => (
    <TextField cellClassName={classes.priceCell} {...props} />
));

export const ProductList = (props) => (
    <List {...props}>
        <Datagrid>
            <PriceField source="price" />
        </Datagrid>
    </List>
);

// renders in the datagrid as
<td class="[class name generated by JSS]"><span>2</span></td>
```

最后，您可能需要覆盖 Field header（datagrid中的 `<th>` 元素）。在这种情况下，使用 `headerClassName` 属性：

```jsx
import { withStyles } from '@material-ui/core/styles';

const styles = {
    priceHeader: { fontWeight: 'bold' },
};

const PriceField = withStyles(styles)(({ classes, ...props }) => (
    <TextField headerClassName={classes.priceHeader} {...props} />
));

export const ProductList = (props) => (
    <List {...props}>
        <Datagrid>
            <PriceField source="price" />
        </Datagrid>
    </List>
);
// renders in the table header as
<th class="[class name generated by JSS]"><button>Price</button></td>
```

最后，有时候，您只想对齐单元格的文本。使用` textAlign </ code> 属性，它接受<code> left ` 或 ` right `：

```jsx
const PriceField = props => (
    <TextField {...props} />
);

PriceField.defaultProps = {
    textAlign: 'right',
};
```

## 编写你自己的 Field 组件

如果你在上面的列表中找不到您需要的内容，编写你自己的 Field 组件非常容易。 它必须是一个常规的 React 组件，不仅可以接受 `source` 属性，还可以接受`record` 属性。 React-admin 将在渲染时基于 API 响应数据注入 `record`。 字段组件只需要在 `record` 中找到 `source` 并显示它。

例如, 这里是一个类似的 react-admin 的 `<TextField>` 组件：

```jsx
import React from 'react';
import PropTypes from 'prop-types';

const TextField = ({ source, record = {} }) => <span>{record[source]}</span>;

TextField.propTypes = {
    label: PropTypes.string,
    record: PropTypes.object,
    source: PropTypes.string.isRequired,
};

export default TextField;
```

**提示**：`label` 属性不使用在 `render()` 方法, 但 react-admin 使用它来显示表头。

**提示**：如果想要支持深层 Field source（例如`author.name` 等 source code），请使用[`lodash.get`](https://www.npmjs.com/package/lodash.get) 替换简单的对象查找：

```jsx
import get from 'lodash/get';
const TextField = ({ source, record = {} }) => <span>{get(record, source)}</span>;
```

如果您不是在寻找可重用性，您可以创建更简单的组件，没有任何属性。 假设一个API返回具有 `firstName` 和 `lastName` 属性的用户记录，并且要在用户列表中显示全名。

```jsx
{
    id: 123,
    firstName: 'John',
    lastName: 'Doe'
}
```

该组件将是：

```jsx
import React from 'react';
import { List, Datagrid, TextField } from 'react-admin';

const FullNameField = ({ record = {} }) => <span>{record.firstName} {record.lastName}</span>;
FullNameField.defaultProps = { label: 'Name' };

export const UserList = (props) => (
    <List {...props}>
        <Datagrid>
            <FullNameField source="lastName" />
        </Datagrid>
    </List>
);
```

**提示**：在此类自定义字段中，` source `是可选的。 React-admin 使用它来确定单击列标题时用于排序的列。 如果您将` source `属性用于其他目的，则可以通过任何` Field `组件上的` sortBy `属性覆盖排序。

## 在 "Show" 视图中向自定义 Field 组件添加标签

React-admin 允许您在 List 视图和 Show 视图中使用相同的 Field 组件。 但是，如果您使用之前在 “Show” 视图中定义的` <FullNameField> `自定义 Field 组件，则会缺少某些内容：Field label。 为什么其他 Field 有标签而这个自定义 Field 没有？ 如何在 “Show” 视图中创建一个具有 label 但不在 “List” 视图中的 Field 组件？

React-admin 使用的技巧：Show 视图布局 (`<SimpleShowLayout>` 和 `<TabbedShowLayout>`) 检查他们的 Field 子级, 并且每当一个有 `addLabel` 属性设置为 `true`时，布局将添加一个 label。

这意味着您需要添加到自定义组件以使其在 Show 视图中可用的唯一内容是` addLabel: true </ code> 默认属性。</p>

<pre><code class="jsx">FullNameField.defaultProps = {
    addLabel: true,
};
`</pre> 

## 基于其他值隐藏 Field

在 Show 视图中，您可能希望根据另一个 Field 的值显示或隐藏 Field- 例如，仅当` hasEmail `布尔字段为` true `时，才显示` email </ code> Field。</p>

<p>对于这种情况，您可以使用自定义 Field 方法：使用注入的 <code>record</ code> 属性，并根据值渲染另一个 Field。</p>

<pre><code class="jsx">import React from 'react';
import { EmailField } from 'react-admin';

const ConditionalEmailField = ({ record, ...rest }) => 
    record && record.hasEmail 
        ? <EmailField source="email" record={record} {...rest} />
        : null;

export default ConditionalEmailField;
`</pre> 

**提示**：在检查其属性之前，请务必检查是否已定义`record`，因为 react-admin 会在从数据中提取记录 *之前* 显示 Show 视图。 因此，第一次呈现资源的show视图时，`record`是未定义的。

当 `hasEmail` 为 false 时, 此 `ConditionalEmailField` 正确隐藏。 但是当 `hasEmail` 为 true 时, 显示布局将呈现它。 没有标签。 如果添加` addLabel `默认属性，则无论` hasEmail `值如何，Show布局都会呈现label...

一种解决方案是在自定义组件中手动添加label：

```jsx
import React from 'react';
import { Labeled, EmailField } from 'react-admin';

const ConditionalEmailField = ({ record, ...rest }) => 
    record && record.hasEmail 
        ? (
            <Labeled label="Email">
                <EmailField source="email" record={record} {...rest} />
            </Labeled>
        )
        : null;

export default ConditionalEmailField;
```

但是这有一个缺点：`< ConditionalEmailField> `不能再用于List视图，因为它总是有一个标签。 如果要在 List 中重用自定义组件，则这不是正确的解决方案。

另一种解决方案是拆分`< Show> `组件。 在引擎盖下，`< Show> ` 组件由两个子组件组成：`<ShowController> `组件，用于获取记录，`<ShowView> </ code>，负责呈现视图标题，操作和子项。 <code><ShowController> ` 使用 *render props</ em> 模式：</p> 

```jsx
// inside react-admin
const Show = props => (
    <ShowController {...props}>
        {controllerProps => <ShowView {...props} {...controllerProps} />}
    </ShowController>
);
```

`<ShowController>` 从 Data Provider 中提取 `记录`, 并将其传递给其子级接收时的函数 (在 `controllerProps` 中)。 这意味着以下代码：

```jsx
import { Show, SimpleShowLayout, TextField } from 'react-admin';

const UserShow = props => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="username" />
            <TextField source="email" />
        </SimpleShowLayout>
    </Show>
);
```

相当于：

```jsx
import { ShowController, ShowView, SimpleShowLayout, TextField } from 'react-admin';

const UserShow = props => (
    <ShowController {...props}>
        {controllerProps => 
            <ShowView {...props} {...controllerProps}>
                <SimpleShowLayout>
                    <TextField source="username" />
                    <TextField source="email" />
                </SimpleShowLayout>
            </ShowView>
        }
    </ShowController>
);
```

如果希望基于 `record` 显示一个字段，例如，仅当 `hasEmail` 时字段为 `true`时才显示电子邮件 Field，只需测试 `controllerProps.record` 的值, 如下所示：

```jsx
import { ShowController, ShowView, SimpleShowLayout, TextField } from 'react-admin';

const UserShow = props => (
    <ShowController {...props}>
        {controllerProps => 
            <ShowView {...props} {...controllerProps}>
                <SimpleShowLayout>
                    <TextField source="username" />
                    {controllerProps.record && controllerProps.record.hasEmail && 
                        <TextField source="email" />
                    }
                </SimpleShowLayout>
            </ShowView>
        }
    </ShowController>
);
```

现在，您可以使用常规 Field 组件, 并且 label 在 "Show" 视图中正确显示。