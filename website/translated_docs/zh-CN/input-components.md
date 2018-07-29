---
id: input-components
title: <Input> components
---
`Input` 组件显示一个输入, 或一个下拉列表, 一个单选按钮列表, 等等。 这些组件允许编辑记录属性，并且在 `<Edit>`， `<Create>` 和 `<Filter>` 视图中是常见的。

```jsx
// in src/posts.js
import React from 'react';
import { Edit, DisabledInput, LongTextInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

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
```

所有输入组件都接受以下属性：

* `source`：view/edit 中你实体的属性名称。此属性是必需的。
* `defaultValue`：当属性为 `null` 或 `undefined` 时要设置的值。
* `validate`：当前属性的验证规则（请参阅\[Validation Documentation\](./CreateEdit.html#validation)）
* `label`：用作输入标签的 header。省略时默认为 `source`。
* `style`：用于定制字段容器的外观和风格的样式对象（例如表单中的 `<div>`）。
* `elStyle`：一个样式对象，用于定制字段元素本身的外观。

```jsx
<TextInput source="zb_title" label="Title" />
```

其他属性传递给底层组件（通常是 material-ui 组件）。 例如，在` TextInput `组件上设置` fullWidth ` 属性时，底层 material-ui `<TextField>` 接收它，并且全宽。

**提示**：如果编辑具有复杂结构的记录，则可以使用路径作为` source `参数。 例如，如果 API 返回以下 “book” 记录：

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

然后，您可以显示文本输入以便编辑作者名字，如下所示： 

```jsx
<TextInput source="author.firstName" />
```

**提示**：如果您的界面必须支持多种语言，请不要使用` label ` 属性，而是将本地化标签放入字典中。 有关详细信息，请参阅[翻译文档](./Translation.md#translating-resource-and-field-names)。

## `ArrayInput` 组件

要编辑嵌入记录中的数据数组，`<ArrayInput>` 会创建子表单列表。

```jsx
import { ArrayInput, SimpleFormIterator, DateInput, UrlInput } from 'react-admin';

<ArrayInput source="backlinks">
    <SimpleFormIterator>
        <DateInput source="date" />
        <UrlInput source="url" />
    </SimpleFormIterator>
</ArrayInput>
```

![ArrayInput](https://marmelab.com/react-admin/img/array-input.png)

`<ArrayInput>` 允许嵌入式数组的编辑，例如以下 `post `记录中的` backlinks `字段：

```js
{
  id: 123
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

`<ArrayInput>` 需要一个子节点，它必须是* 表单迭代器 *组件。 表单迭代器是一个组件，它接受由redux-form `<FieldArray>` 组件传递的 `fields` 对象，并定义 fields 数组的布局。 例如，`<SimpleFormIterator>` 组件显示无序列表（`<ul>`）中的字段数组，按列表项（`<li>`）显示一个子表单。 它还提供了添加和删除子记录的控件（在此示例中为反向链接）。

您可以将 `disableAdd` 和 `disableRemove` 作为 `SimpleFormIterator` 的属性传递，分别禁用 `ADD` 和 `REMOVE` 按钮。 两者的默认值均为 `false`。

```jsx
import { ArrayInput, SimpleFormIterator, DateInput, UrlInput } from 'react-admin';

<ArrayInput source="backlinks">
    <SimpleFormIterator disableRemove >
        <DateInput source="date" />
        <UrlInput source="url" />
    </SimpleFormIterator>
</ArrayInput>
```

## ` AutocompleteInput `组件

要让用户使用带有自动完成功能的下拉列表在 list 中选择一个值, 请使用 `<AutocompleteInput>`。 它使用 [ react-autosuggest](http://react-autosuggest.js.org/) 和 `fuzzySearch` 筛选器渲染。 设置 `choices` 属性以确定选项列表 (使用 `id`, `name` tuples)。

```jsx
import { AutocompleteInput } from 'react-admin';

<AutocompleteInput source="category" choices={[
    { id: 'programming', name: 'Programming' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'photography', name: 'Photography' },
]} />
```

还可以自定义用于选项名称和值的属性，这归功于 `optionText` 和 `optionValue` 属性：

```jsx
const choices = [
    { _id: 123, full_name: 'Leo Tolstoi', sex: 'M' },
    { _id: 456, full_name: 'Jane Austen', sex: 'F' },
];
<AutocompleteInput source="author_id" choices={choices} optionText="full_name" optionValue="_id" />
```

`optionText` 也接受一个函数，所以你可以随意设置选项文本：

```jsx
const choices = [
   { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
   { id: 456, first_name: 'Jane', last_name: 'Austen' },
];
const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
<AutocompleteInput source="author_id" choices={choices} optionText={optionRenderer} />
```

默认情况下将转换这些选项，因此可以将翻译标识符用作选项：

```jsx
const choices = [
   { id: 'M', name: 'myroot.gender.male' },
   { id: 'F', name: 'myroot.gender.female' },
];
```

但是, 在某些情况下 (例如, 在 `<ReferenceInput>`中)，您可能不希望翻译该选项。在这种情况下, 将 `translateChoice` 设置为 false。

```jsx
<AutocompleteInput source="gender" choices={choices} translateChoice={false}/>
```

默认情况下，组件使用当前 Input searchText 匹配选项：如果找到匹配项，则将选择此选项。 例如，给出选项` [{id：'M'，name：'Male'，id：'F'，name：'Female'}] `，当用户输入文本` male `时，然后组件将输入值设置为` M </ code>。 如果需要更改选择的匹配方式, 请将自定义函数作为 <code>inputValueMatcher` 属性传递。 例如，给定以下选项：`[{id:1,iso2:'NL',name:'Dutch'},{id:2,iso2:'EN',name:'English'},{id:3,iso2:'FR',name:'French'}]`，如果要匹配 iso2 上的选项代码中, 可以创建以下 `inputValueMatcher` 函数：

```javascript
<AutocompleteInput inputValueMatcher={
    (input, suggestion, getOptionText) => 
        input.toUpperCase().trim() === suggestion.iso2 || 
        input.toLowerCase().trim() === getOptionText(suggestion).toLowerCase().trim()
}/>
```

如果要将显示的初始选择限制为仅当前值，可以设置` limitChoicesToValue </ 0> 属性。</p>

<p>最后，<code><AutocompleteInput>` 呈现 material-ui `<TextField> `组件。 使用` options `属性覆盖任何 `<TextField>` 属性：

{% raw %}

```jsx
<AutocompleteInput source="category" options={{
    fullWidth: true,
}} />
```

{% endraw %}

**提示**：如果要使用相关记录的列表填充 `choices` 属性，则应使用 [`<ReferenceInput>`](#referenceinput) 装饰`<AutocompleteInput>`，并将 `choices` 留空：

```jsx
import { AutocompleteInput, ReferenceInput } from 'react-admin'

<ReferenceInput label="Post" source="post_id" reference="posts">
    <AutocompleteInput optionText="title" />
</ReferenceInput>
```

**提示**： `<AutocompleteInput>` 是一个无状态组件，所以它只允许 *过滤* choice 列表，而不是 *扩展*。 如果您需要根据 `fetch` 调用的结果填充选项列表（如[`<ReferenceInput>`](#referenceinput)不能满足您的需要），你得编写[自己的输入组件](#writing-your-own-input-component)， 基于 material-ui `<AutoComplete>` 组件。

**提示**：React-admin 的 `<AutocompleteInput>` 只有一个大写字母 A，而 material-ui 的 `<AutoComplete>` 有一个大写字母A和一个大写字母C。不要混淆组件！

### Properties

| Prop                  | Required | Type                     | Default                                                                                                                  | Description                                                                                                                                                                                                                                   |
| --------------------- | -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `choices`             | Required | `Object[]`               | -                                                                                                                        | List of items to autosuggest                                                                                                                                                                                                                  |
| `resource`            | Required | `string`                 | -                                                                                                                        | The resource working on. This field is passed down by wrapped components like `Create` and `Edit`.                                                                                                                                            |
| `source`              | Required | `string`                 | -                                                                                                                        | Name of field to edit, its type should match the type retrieved from `optionValue`                                                                                                                                                            |
| `allowEmpty`          | Optional | `boolean`                | `false`                                                                                                                  | If `false` and the searchText typed did not match any suggestion, the searchText will revert to the current value when the field is blurred. If `true` and the `searchText` is set to `''` then the field will set the input value to `null`. |
| `inputValueMatcher`   | Optional | `Function`               | `(input, suggestion, getOptionText) => input.toLowerCase().trim() === getOptionText(suggestion).toLowerCase().trim()` | Allows to define how choices are matched with the searchText while typing.                                                                                                                                                                    |
| `optionValue`         | Optional | `string`                 | `id`                                                                                                                     | Fieldname of record containing the value to use as input value                                                                                                                                                                                |
| `optionText`          | Optional | `string &#124; Function` | `name`                                                                                                                   | Fieldname of record to display in the suggestion item or function which accepts the currect record as argument (`(record)=> {string}`)                                                                                                     |
| `setFilter`           | Optional | `Function`               | null                                                                                                                     | A callback to inform the `searchText` has changed and new `choices` can be retrieved based on this `searchText`. Signature `searchText => void`. This function is automatically setup when using `ReferenceInput`.                         |
| `suggestionComponent` | Optional | Function                 | `({ suggestion, query, isHighlighted, props }) => <div {...props} />`                                           | Allows to override how the item is rendered.                                                                                                                                                                                                  |

## `BooleanInput` 与 `NullableBooleanInput` 组件

`<BooleanInput />` 是一个切换按钮，允许您把 `true` 或 `false` 值归于一个记录字段。

```jsx
import { BooleanInput } from 'react-admin';

<BooleanInput label="Commentable" source="commentable" />
```

![BooleanInput](https://marmelab.com/react-admin/img/boolean-input.png)

此输入不处理 `null` 值。如果您必须处理非设置的布尔值，则需要 `<NullableBooleanInput />` 组件。

您可以使用` options ` 属性传递Material UI ` Switch `组件支持的任何选项。 例如，以下是设置自定义选中图标的方法：

{% raw %}

```jsx
import { BooleanInput } from 'react-admin';
import FavoriteIcon from '@material-ui/icons/Favorite';

<BooleanInput
    source="favorite"
    options={{
        checkedIcon: <FavoriteIcon />,
    }}
/>
```

{% endraw %}

![CustomBooleanInputCheckIcon](https://marmelab.com/react-admin/img/custom-switch-icon.png)

有关详细信息, 请参阅 [Material UI Switch 文档](http://www.material-ui.com/#/components/switch)。

`<NullableBooleanInput />` 呈现为下拉列表，允许在 true、false 和 null 值之间进行选择。

```jsx
import { NullableBooleanInput } from 'react-admin';

<NullableBooleanInput label="Commentable" source="commentable" />
```

![NullableBooleanInput](https://marmelab.com/react-admin/img/nullable-boolean-input.png)

## `CheckboxGroupInput` 组件

如果要让用户通过显示所有可能的值来选择多个值, 则 `<CheckboxGroupInput>` 是正确的组件。 设置 `choices` 属性以确定 options （使用 `id`, `name` 元组）：

```jsx
import { CheckboxGroupInput } from 'react-admin';

<CheckboxGroupInput source="category" choices={[
    { id: 'programming', name: 'Programming' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'photography', name: 'Photography' },
]} />
```

![CheckboxGroupInput](https://marmelab.com/react-admin/img/checkbox-group-input.png)

还可以自定义用于选项名称和值的属性，这归功于 `optionText` 和 `optionValue` 属性：

```jsx
const choices = [
    { _id: 123, full_name: 'Leo Tolstoi', sex: 'M' },
    { _id: 456, full_name: 'Jane Austen', sex: 'F' },
];
<CheckboxGroupInput source="author_id" choices={choices} optionText="full_name" optionValue="_id" />
```

`optionText` 还接受一个函数, 因此您可以按意愿对选项文本进行设置：

```jsx
const choices = [
   { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
   { id: 456, first_name: 'Jane', last_name: 'Austen' },
];
const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
<CheckboxGroupInput source="author_id" choices={choices} optionText={optionRenderer} />
```

`optionText` 还接受一个 React 元素, 它将被克隆并接收与 `record` 属性相关的选项。您可以在那里使用 Field 组件。

```jsx
const choices = [
   { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
   { id: 456, first_name: 'Jane', last_name: 'Austen' },
];
const FullNameField = ({ record }) => <span>{record.first_name} {record.last_name}</span>;
<CheckboxGroupInput source="gender" choices={choices} optionText={<FullNameField />}/>
```

默认情况下翻译当前选项，因此您可以使用翻译标识符作为选项：

```jsx
const choices = [
    { id: 'programming', name: 'myroot.category.programming' },
    { id: 'lifestyle', name: 'myroot.category.lifestyle' },
    { id: 'photography', name: 'myroot.category.photography' },
];
```

但是, 在某些情况下 (例如, 在 `<ReferenceInput>`中)，您可能不希望翻译该选项。在这种情况下，将 `translateChoice` 设置为 false。

```jsx
<CheckboxGroupInput source="gender" choices={choices} translateChoice={false}/>
```

最后，如果要覆盖任何 Material UI 的 `<Checkbox>` 属性，请使用` options `属性：

{% raw %}

```jsx
<CheckboxGroupInput source="category" options={{
    labelPosition: 'right'
}} />
```

{% endraw %}

有关详细信息, 请参阅 [Material UI Checkbox 文档](http://www.material-ui.com/#/components/checkbox)。

## `DateInput` 组件

理想的编辑日期, `<DateInput>` 呈现标准浏览器 [日期选取器](http://www.material-ui.com/#/components/date-picker)。

```jsx
import { DateInput } from 'react-admin';

<DateInput source="published_at" />
```

![DateInput](./img/date-input.gif)

## `DisabledInput` 组件

如果要在 `<Edit></ code> 表单中显示记录属性而不让用户更新它（例如自动递增的主键），请使用<code><DisabledInput>`：

```jsx
import { DisabledInput } from 'react-admin';

<DisabledInput source="id" />
```

![DisabledInput](https://marmelab.com/react-admin/img/disabled-input.png)

**提示</ strong>：要将不可修改的字段添加到 `<Edit>` 视图，您还可以使用 react-admin ` Field `组件之一：</p> 

```jsx
// in src/posts.js
import { Edit, LongTextInput, SimpleForm, TextField } from 'react-admin';

export const PostEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <TextField source="title" /> {/* NOT EDITABLE */}
            <LongTextInput source="body" />
        </SimpleForm>
    </Edit>
);
```

**提示**：您甚至可以使用自己的组件，前提是它接受 `record` 属性：

```jsx
// in src/posts.js
import { Edit, Labeled, LongTextInput, SimpleForm } from 'react-admin';

const titleStyle = { textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '20em' };
const Title = ({ record, label }) => (
    <Labeled label={label}>
        <span style={titleStyle}>{record.title}</span>
    </Labeled>
);

export const PostEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <Title label="Title" />
            <LongTextInput source="body" />
        </SimpleForm>
    </Edit>
);
```

## `ImageInput` 组件

`<ImageInput>` 允许使用 [react-dropzone](https://github.com/okonet/react-dropzone) 上传一些图片。

![ImageInput](https://marmelab.com/react-admin/img/image-input.png)

使用 `<ImageInput>` 子项启用预览，如下所示：

```jsx
<ImageInput source="pictures" label="Related pictures" accept="image/*">
    <ImageField source="src" title="title" />
</ImageInput>
```

编写用于显示当前值的自定义 field 组件很简单：它是标准的 [Field](./Fields.md#writing_your_own_field_component)。

当接收到 **新的** 文件时，`ImageInput` 会将一个 `rawFile` 属性添加到作为子级 `record` 属性传递的对象中。 这个 `rawFile` 是新添加的文件 [File](https://developer.mozilla.org/en-US/docs/Web/API/File) 的实例。 这对于在自定义字段内显示大小或 mimetype 的信息很有用。

除了react-admin之外，`ImageInput` 组件还接受所有 [react-dropzone](https://github.com/okonet/react-dropzone#features) 属性。 例如，如果您需要一次上传多个图像，只需将`多个` DropZone 属性添加到`<ImageInput/>` field 即可。

如果默认的 dropzone 上标签不符合您的需要, 则可以传递 `placeholder` 属性来覆盖它。 属性可以是任何 React 可以渲染的东西（`PropTypes.node`）：

```jsx
<ImageInput source="pictures" label="Related pictures" accept="image/*" placeholder={<p>Drop your file here</p>}>
    <ImageField source="src" title="title" />
</ImageInput>
```

请注意, 图像上载返回 [File](https://developer.mozilla.org/en/docs/Web/API/File) 对象。 根据您的 API 行为来处理它是您的责任。 例如，可以在 base64 中对其进行编码或者将其作为多部分表单数据发送。 通过扩展 REST 客户端，检查此 [示例](./DataProviders.md#decorating-your-rest-client-example-of-file-upload) 以获取 base64 编码数据。

## `FileInput` 组件

`<FileInput>` 允许使用 [react-dropzone](https://github.com/okonet/react-dropzone) 上传一些文件。

![FileInput](https://marmelab.com/react-admin/img/file-input.png)

使用 `<FileInput>` 子级启用预览（实际上是一个简单的文件名称列表），如下所示：

```jsx
<FileInput source="files" label="Related files" accept="application/pdf">
    <FileField source="src" title="title" />
</FileInput>
```

编写用于显示当前值的自定义字段组件很简单：它是标准的 [field](./Fields.md#writing_your_own_field_component)

当接收到 **新的** 文件时， `FileInput` 将会将一个 `rawFile` 属性添加到作为子级 `record` 属性传递的对象中。 这个 `rawFile` 是新添加的文件的 [File](https://developer.mozilla.org/en-US/docs/Web/API/File) 实例。 这对于在自定义字段内显示大小或 mimetype 的信息很有用。

除了 react-admin 之外，`FileInput` 组件还接受所有 [react-dropzone](https://github.com/okonet/react-dropzone#features) 属性。 例如，如果您需要一次上传多个文件，只需将`多个` DropZone 属性添加到`<FileInput />` field 即可。

如果默认的 dropzone 上标签不符合您的需要, 则可以传递 `placeholder` 属性来覆盖它。 属性可以是任何 React 可以渲染的东西（`PropTypes.node`）：

```jsx
<FileInput source="files" label="Related files" accept="application/pdf" placeholder={<p>Drop your file here</p>}>
    <ImageField source="src" title="title" />
</FileInput>
```

请注意, 文件上载返回 [File](https://developer.mozilla.org/en/docs/Web/API/File) 对象。 根据您的 API 行为来处理它是您的责任。 例如，可以在 base64 中对其进行编码或者将其作为多部分表单数据发送。 通过扩展 REST 客户端，查看此 [示例](./DataProviders.md#decorating-your-rest-client-example-of-file-upload) 以获取 base64 编码数据。

## `LongTextInput` 组件

`<LongTextInput>` 是多行文本值的最佳选择。它呈现为自动扩展 textarea。

```jsx
import { LongTextInput } from 'react-admin';

<LongTextInput source="teaser" />
```

![LongTextInput](https://marmelab.com/react-admin/img/long-text-input.png)

## `NumberInput` 组件

`<NumberInput>` 转换为HTMl `<input type="number">`。 由于 [known React bug](https://github.com/facebook/react/issues/1425)，因此数字值是必需的，在那种情况下这阻止了使用更通用的 [<TextInput></code>](#textinput)。

```jsx
import { NumberInput } from 'react-admin';

<NumberInput source="nb_views" />
```

您可以自定义 `step` 属性（默认为“any”）：

```jsx
<NumberInput source="nb_views" step={1} />
```

## `RadioButtonGroupInput` 组件

如果要让用户通过显示的所有值（而不是将它们隐藏在下拉列表之后）选择一个在可能值列表中的值，如 [`<SelectInput>`](#selectinput)，`<RadioButtonGroupInput>` 是正确的组件。 设置 `choices` 属性来确定选项（使用 `id`，`name` 元组）：

```jsx
import { RadioButtonGroupInput } from 'react-admin';

<RadioButtonGroupInput source="category" choices={[
    { id: 'programming', name: 'Programming' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'photography', name: 'Photography' },
]} />
```

![RadioButtonGroupInput](https://marmelab.com/react-admin/img/radio-button-group-input.png)

还可以自定义用于选项名称和值的属性, 这归功于 `optionText` 和 `optionValue` 属性：

```jsx
const choices = [
    { _id: 123, full_name: 'Leo Tolstoi', sex: 'M' },
    { _id: 456, full_name: 'Jane Austen', sex: 'F' },
];
<RadioButtonGroupInput source="author_id" choices={choices} optionText="full_name" optionValue="_id" />
```

`optionText` 还接受一个函数, 因此您可以按意愿对选项文本进行设置：

```jsx
const choices = [
   { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
   { id: 456, first_name: 'Jane', last_name: 'Austen' },
];
const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
<RadioButtonGroupInput source="author_id" choices={choices} optionText={optionRenderer} />
```

`optionText` 也接受一个 React 元素，它将被克隆，并接收相关选择作为 `record` 属性。您可以在那里使用 Field 组件。

```jsx
const choices = [
   { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
   { id: 456, first_name: 'Jane', last_name: 'Austen' },
];
const FullNameField = ({ record }) => <span>{record.first_name} {record.last_name}</span>;
<RadioButtonGroupInput source="gender" choices={choices} optionText={<FullNameField />}/>
```

默认情况下翻译当前选项，因此您可以使用翻译标识符作为选项：

```jsx
const choices = [
   { id: 'M', name: 'myroot.gender.male' },
   { id: 'F', name: 'myroot.gender.female' },
];
```

但是, 在某些情况下 (例如, 在 `<ReferenceInput>`中)，您可能不希望翻译该选项。在这种情况下, 将 `translateChoice` 设置为 false。

```jsx
<RadioButtonGroupInput source="gender" choices={choices} translateChoice={false}/>
```

最后，如果要覆盖任何 Material UI 的 `<RadioButtonGroup>` 属性，请使用` options `属性：

{% raw %}

```jsx
<RadioButtonGroupInput source="category" options={{
    labelPosition: 'right'
}} />
```

{% endraw %}

有关详细信息, 请参阅 [Material UI RadioGroup 文档](http://www.material-ui.com/#/components/radio-button)。

**提示**：如果要使用相关记录的列表填充 `choices` 属性，则应使用 [`<ReferenceInput>`](#referenceinput) 装饰`<AutocompleteInput>`，并将 `choices` 留空：

```jsx
import { RadioButtonGroupInput, ReferenceInput } from 'react-admin'

<ReferenceInput label="Author" source="author_id" reference="authors">
    <RadioButtonGroupInput optionText="last_name" />
</ReferenceInput>
```

## `ReferenceArrayInput` 组件

使用 `<ReferenceArrayInput>` 编辑引用值数组，即让用户从另一个 REST 端点中选择值列表（通常是外键）。

在引用端点中，`<ReferenceArrayInput>` 获取相关资源（使用`CRUD_GET_MANY` REST方法）与获取可能的资源（使用`CRUD_GET_MATCHING` REST方法）一样

例如，如果 post 对象有许多 tag，则 post 资源可能如下所示：

```js
{
    id: 1234,
    tag_ids: [1, 23, 4]
}
```

然后 `<ReferenceArrayInput>` 将从这两个调用中获取 tag 资源列表：

    http://myapi.com/tags?id=[1,23,4]
    http://myapi.com/tags?page=1&perPage=25
    

一旦接收到重复数据删除的引用资源，该组件将渲染委托给一个子组件，它将可能的选择作为 `choices` 属性传递给该子组件。

这意味着您可以使用具有 [`<SelectArrayInput>`](#selectarrayinput) 的 `<ReferenceArrayInput>`，或者使用您选择的组件，只要它支持 `choices` 属性。

该组件需要一个 `source` 和 `reference` 属性。 例如，要使 `post` 的 `tag_ids` 可编辑：

```js
import { ReferenceArrayInput, SelectArrayInput } from 'react-admin'

<ReferenceArrayInput source="tag_ids" reference="tags">
    <SelectArrayInput optionText="name" />
</ReferenceArrayInput>
```

![SelectArrayInput](https://marmelab.com/react-admin/img/select-array-input.gif)

**注意**：你**必须**为引用资源添加一个`<Resource>` - react-admin 需要它来获取引用数据。 如果你想在侧边栏菜单中隐藏它，你 可以 省略此引用中的 list 属性。

```js
<Admin dataProvider={myDataProvider}>
    <Resource name="posts" list={PostList} edit={PostEdit} />
    <Resource name="tags" />
</Admin>
```

如果要在选项列表中添加值为null的空选项，请设置` allowEmpty ` 属性。 禁用` allowEmpty `并不意味着需要输入。 如果要进行所需的输入，则必须按照 [验证文档](./CreateEdit.html#validation) 中的说明添加验证器。 启用 `allowEmpty` 属性只会在选项之上添加一个空选项（具有` null `值），并使值可为空。

```js
import { ReferenceArrayInput, SelectArrayInput } from 'react-admin'

<ReferenceArrayInput source="tag_ids" reference="tags" allowEmpty>
    <SelectArrayInput optionText="name" />
</ReferenceArrayInput>
```

**提示</ strong>：默认情况下为 `<Filter>` 组件的所有子级输入组件设置` allowEmpty `</p> 

您可以使用` perPage `，` sort `和` filter ` 属性来调整此组件如何获取可能的值。

{% raw %}

```js
// by default, fetches only the first 25 values. You can extend this limit
// by setting the `perPage` prop.
<ReferenceArrayInput
     source="tag_ids"
     reference="tags"
     perPage={100}>
    <SelectArrayInput optionText="name" />
</ReferenceArrayInput>

// by default, orders the possible values by id desc. You can change this order
// by setting the `sort` prop (an object with `field` and `order` properties).
<ReferenceArrayInput
     source="tag_ids"
     reference="tags"
     sort={{ field: 'title', order: 'ASC' }}>
    <SelectArrayInput optionText="name" />
</ReferenceArrayInput>

// you can filter the query used to populate the possible values. Use the
// `filter` prop for that.
<ReferenceArrayInput
     source="tag_ids"
     reference="tags"
     filter={{ is_published: true }}>
    <SelectArrayInput optionText="name" />
</ReferenceArrayInput>
```

{% endraw %}

## `ReferenceInput` 组件

例如，对外键值使用 `<ReferenceInput>` 来编辑 `comment` 资源的 `post_id`。 此组件获取引用资源中的可能值（使用 `GET_LIST` REST方法）和引用的记录（使用 `GET_ONE` REST方法），然后将呈现委托给子组件，它将可能的选项作为 `choices` 属性传递给子组件。

这意味着您可以将 `<ReferenceInput>` 与 [`<SelectInput>`](#selectinput) ，[`<AutocompleteInput>`](#autocompleteinput) 或 [`<RadioButtonGroupInput>`](#radiobuttongroupinput) 中的任何一个一起使用，或者甚至使用您选择的组件，前提是它支持 `choices` 属性。

该组件需要一个 `source` 和 `reference` 属性。 例如，要使 `comment` 的 `post_id` 可编辑：

```jsx
import { ReferenceInput, SelectInput } from 'react-admin'

<ReferenceInput label="Post" source="post_id" reference="posts">
    <SelectInput optionText="title" />
</ReferenceInput>
```

![ReferenceInput](https://marmelab.com/react-admin/img/reference-input.gif)

**注意**：你**必须**为引用资源添加一个`<Resource>` - react-admin 需要它来获取引用数据。 如果你想在侧边栏菜单中隐藏它，你 *可以* 省略此引用中的 `list` 属性。

```jsx
<Admin dataProvider={myDataProvider}>
    <Resource name="comments" list={CommentList} />
    <Resource name="posts" />
</Admin>
```

如果要在选项列表中添加值为 null 的空选项，请设置` allowEmpty ` 属性。 禁用` allowEmpty `并不意味着需要输入。 如果要进行所需的输入，则必须按照 [验证文档](./CreateEdit.html#validation) 中的说明添加验证器。 启用 `allowEmpty` 属性只会在选项之上添加一个空选项（具有` null `值），并使值可为空。

```jsx
import { ReferenceInput, SelectInput } from 'react-admin'

<ReferenceInput label="Post" source="post_id" reference="posts" allowEmpty>
    <SelectInput optionText="title" />
</ReferenceInput>
```

**提示</ strong>：默认情况下为 `<Filter>` 组件的所有子级输入组件设置` allowEmpty `：</p> 

```jsx
const CommentFilter = (props) => (
    <Filter {...props}>
        <ReferenceInput label="Post" source="post_id" reference="posts"> // no need for allowEmpty
            <SelectInput optionText="title" />
        </ReferenceInput>
    </Filter>
);
```

您可以使用` perPage `，` sort `和` filter ` 属性来调整此组件如何获取可能的值。

{% raw %}

```jsx
// by default, fetches only the first 25 values. You can extend this limit
// by setting the `perPage` prop.
<ReferenceInput
     source="post_id"
     reference="posts"
     perPage={100}>
    <SelectInput optionText="title" />
</ReferenceInput>

// by default, orders the possible values by id desc. You can change this order
// by setting the `sort` prop (an object with `field` and `order` properties).
<ReferenceInput
     source="post_id"
     reference="posts"
     sort={{ field: 'title', order: 'ASC' }}>
    <SelectInput optionText="title" />
</ReferenceInput>

// you can filter the query used to populate the possible values. Use the
// `filter` prop for that.
<ReferenceInput
     source="post_id"
     reference="posts"
     filter={{ is_published: true }}>
    <SelectInput optionText="title" />
</ReferenceInput>
```

{% endraw %}

子组件可以进一步过滤结果（例如，`< AutocompleteInput>`的情况）。 ReferenceInput 将 ` setFilter `函数作为属性传递给其子组件。 它使用该值为查询创建过滤器 - 默认情况下为 `{q: [searchText] }`。 您可以自定义映射 `searchText => searchQuery `通过设置自定义` filterToQuery ` 函数属性：

```jsx
<ReferenceInput
     source="post_id"
     reference="posts"
     filterToQuery={searchText => ({ title: searchText })}>
    <SelectInput optionText="title" />
</ReferenceInput>
```

子组件从 `<ReferenceInput>` 接收以下属性：

* `isLoading`: whether the request for possible values is loading or not
* `filter`: the current filter of the request for possible values. Defaults to `{}`.
* `pagination`: the current pagination of the request for possible values. Defaults to `{ page: 1, perPage: 25 }`.
* `sort`: the current sorting of the request for possible values. Defaults to `{ field: 'id', order: 'DESC' }`.
* `error`: the error message if the form validation failed for that input
* `warning`: the warning message if the form validation failed for that input
* `onChange`: function to call when the value changes
* `setFilter`: function to call to update the filter of the request for possible values
* `setPagination`: : function to call to update the pagination of the request for possible values
* `setSort`: function to call to update the sorting of the request for possible values

## ` RichTextInput ` 组件

如果您希望允许用户编辑某些 HTML 内容，`<RichTextInput>` 是理想的组件。它由 [Quill](https://quilljs.com/) 提供动力。

注意：由于其大小，`<RichTextInput>` 默认情况下不与 react-admin 捆绑在一起。 您必须先使用npm 安装它：

```sh
npm install ra-input-rich-text
```

Then use it as a normal input component:

```jsx
import RichTextInput from 'ra-input-rich-text';

<RichTextInput source="body" />
```

![RichTextInput](https://marmelab.com/react-admin/img/rich-text-input.png)

您可以使用 `toolbar` 属性自定义富文本编辑器工具栏，如 [Quill官方工具栏文档](https://quilljs.com/docs/modules/toolbar/) 中所述。

```jsx
<RichTextInput source="body" toolbar={[ ['bold', 'italic', 'underline', 'link'] ]} />
```

## `SelectInput` 组件

要让用户使用下拉列表选择 list 中的值, 请使用 `<SelectInput>`。 它使用 [ Material ui 的 `<SelectField>`](http://www.material-ui.com/#/components/select-field) 呈现。 设置 `choices` 属性以确定 options（具有 `id`, `name` 元组）：

```jsx
import { SelectInput } from 'react-admin';

<SelectInput source="category" choices={[
    { id: 'programming', name: 'Programming' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'photography', name: 'Photography' },
]} />
```

![SelectInput](https://marmelab.com/react-admin/img/select-input.gif)

还可以自定义用于选项名称和值的属性, 这归功于 `optionText` 和 `optionValue` 属性：

```jsx
const choices = [
    { _id: 123, full_name: 'Leo Tolstoi', sex: 'M' },
    { _id: 456, full_name: 'Jane Austen', sex: 'F' },
];
<SelectInput source="author_id" choices={choices} optionText="full_name" optionValue="_id" />
```

`optionText` 也接受一个函数，所以你可以随意设置选项文本：

```jsx
const choices = [
   { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
   { id: 456, first_name: 'Jane', last_name: 'Austen' },
];
const optionRenderer = choice => `${choice.first_name} ${choice.last_name}`;
<SelectInput source="author_id" choices={choices} optionText={optionRenderer} />
```

`optionText` 还接受一个 React 元素, 它将被克隆并接收与 `record` 属性相关的选项。您可以在那里使用 Field 组件。

```jsx
const choices = [
   { id: 123, first_name: 'Leo', last_name: 'Tolstoi' },
   { id: 456, first_name: 'Jane', last_name: 'Austen' },
];
const FullNameField = ({ record }) => <span>{record.first_name} {record.last_name}</span>;
<SelectInput source="gender" choices={choices} optionText={<FullNameField />}/>
```

启用 `allowEmpty` 属性只会在选项之上添加一个空选项（具有` null `值），并使值可为空。

```jsx
<SelectInput source="category" allowEmpty choices={[
    { id: 'programming', name: 'Programming' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'photography', name: 'Photography' },
]} />
```

默认情况下翻译当前选项，因此您可以使用翻译标识符作为选项：

```jsx
const choices = [
   { id: 'M', name: 'myroot.gender.male' },
   { id: 'F', name: 'myroot.gender.female' },
];
```

但是, 在某些情况下您可能不希望翻译该选项。在这种情况下, 将 `translateChoice` 设置为 false。

```jsx
<SelectInput source="gender" choices={choices} translateChoice={false}/>
```

请注意，当 `<SelectInput>` 是 `<ReferenceInput>` 的子项时， `translateChoice` 设置为 false。

最后，如果要覆盖任何 Material UI 的 `< SelectField>` 属性，请使用` options `属性：

{% raw %}

```jsx
<SelectInput source="category" options={{
    maxHeight: 200
}} />
```

{% endraw %}

有关详细信息, 请参阅 [Material UI SelectField 文档](http://www.material-ui.com/#/components/select-field)。

**提示**：如果要使用相关记录的列表填充 `choices` 属性，则应使用 [`<ReferenceInput>`](#referenceinput) 装饰 `<SelectInput>` ，并将 `choices` 留空：

```jsx
import { SelectInput, ReferenceInput } from 'react-admin'

<ReferenceInput label="Author" source="author_id" reference="authors">
    <SelectInput optionText="last_name" />
</ReferenceInput>
```

如果您不想将选项显示为下拉列表，而是希望将它们显示为单选按钮列表，请尝试 [`<RadioButtonGroupInput>`](#radiobuttongroupinput)。 如果列表太大，则更喜欢 [`<AutocompleteInput>`](#autocompleteinput)。

## ` SelectArrayInput ` 组件

要让用户使用下拉列表选择 list 中的几个值, 请使用 `< SelectArrayInput>`。 它使用 [ Material ui 的 `< Select>`](http://www.material-ui.com/#/components/select) 呈现。 设置 `choices` 属性以确定 options（具有 `id`, `name` 元组）：

```js
import { SelectArrayInput } from 'react-admin';

<SelectArrayInput label="Tags" source="categories" choices={[
    { id: 'music', name: 'Music' },
    { id: 'photography', name: 'Photo' },
    { id: 'programming', name: 'Code' },
    { id: 'tech', name: 'Technology' },
    { id: 'sport', name: 'Sport' },
]} />
```

![SelectArrayInput](https://marmelab.com/react-admin/img/select-array-input.gif)

还可以自定义用于选项名称和值的属性，这归功于 `optionText` 和 `optionValue` 属性：

```js
const choices = [
   { _id: '1', name: 'Book', plural_name: 'Books' },
   { _id: '2', name: 'Video', plural_name: 'Videos' },
   { _id: '3', name: 'Audio', plural_name: 'Audios' },
];
<SelectArrayInput source="categories" choices={choices} optionText="plural_name" optionValue="_id" />
```

`optionText` 也接受一个函数，所以你可以随意设置选项文本：

```js
const choices = [
   { id: '1', name: 'Book', quantity: 23 },
   { id: '2', name: 'Video', quantity: 56 },
   { id: '3', name: 'Audio', quantity: 12 },
];
const optionRenderer = choice => `${choice.name} (${choice.quantity})`;
<SelectArrayInput source="categories" choices={choices} optionText={optionRenderer} />
```

默认情况下翻译当前选项，因此您可以使用翻译标识符作为选项：

```js
const choices = [
   { id: 'books', name: 'myroot.category.books' },
   { id: 'sport', name: 'myroot.category.sport' },
];
```

最后，如果要覆盖任何 `<Select>` 的属性，请使用` options `属性：

{% raw %}

```js
<SelectArrayInput source="category" options={{ fullWidth: true }} />
```

{% endraw %}

有关详细信息, 请参阅 [ Select 文档](http://www.material-ui.com/#/components/select)。

`SelectArrayInput` 组件**不能**在 `ReferenceInput` 中使用，但可以在`ReferenceArrayInput` 中使用。

```jsx
import React from 'react';
import {
    ChipField,
    Create,
    DateInput,
    LongTextInput,
    ReferenceArrayInput,
    SelectArrayInput,
    TextInput,
} from 'react-admin';

export const PostCreate = props => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="title" />
            <LongTextInput source="body" />
            <DateInput source="published_at" />

            <ReferenceArrayInput reference="tags" source="tags">
                <SelectArrayInput>
                    <ChipField source="name" />
                </SelectArrayInput>
            </ReferenceArrayInput>
        </SimpleForm>
    </Create>
);
```

提示：由于它不提供自动完成功能，因此当引用的资源包含大量项目时，`SelectArrayInput`可能不适用。

## `TextInput` 组件

`<TextInput>` 是最常见的输入。它用于文本、电子邮件、URL 或密码。在转换为 HTML `<input>` 标记中。

```jsx
import { TextInput } from 'react-admin';

<TextInput source="title" />
```

![TextInput](https://marmelab.com/react-admin/img/text-input.png)

可以使用 ` type ` 属性选择特定的输入类型，例如 `text` (默认值)，`email`，`url` 或 `password`：

```jsx
<TextInput label="Email Address" source="email" type="email" />
```

**警告**: 不要使用 `type="number"`, 或者您将收到一个字符串作为值 (这是一个 [已知的React bug](https://github.com/facebook/react/issues/1425))。 相反, 请使用 [`<NumberInput>`](#numberinput)。

## 将输入值转换 to/from 记录

输入组件返回的数据格式可能不是您的 API 所期望的。 由于 React-admin 使用Redux Form，我们可以使用其` parse() ` 和 ` format() `函数在保存到记录并从记录加载时转换 input 值。 在开始之前了解输入值的生命周期会更好。

两个函数的助记符： - `parse()`：input -> record - `format()`：record -> input

假设用户想要将0-100的值输入到百分比字段，但您的API（因此记录）需要0-1.0。 您可以使用简单的 `parse()` 和 `format()` 函数来存档转换：

```jsx
<NumberInput source="percent" format={v => v*100} parse={v => v/100} label="Formatted number" />
```

`<DateInput>` 存储并返回一个字符串。如果您希望将 JavaScript 日期对象存储在记录中，请改用：

```jsx
const dateFormatter = v => {
  // v is a `Date` object
  if (!(v instanceof Date) || isNaN(v)) return;
  const pad = '00';
  const yy = v.getFullYear().toString();
  const mm = (v.getMonth() + 1).toString();
  const dd = v.getDate().toString();
  return `${yy}-${(pad + mm).slice(-2)}-${(pad + dd).slice(-2)}`;
};

const dateParser = v => {
  // v is a string of "YYYY-MM-DD" format
  const match = /(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (match === null) return;
  const d = new Date(match[1], parseInt(match[2], 10) - 1, match[3]);
  if (isNaN(d)) return;
  return d;
};

<DateInput source="isodate" format={dateFormatter} parse={dateParser} />
```

## 第三方组件

您可以在第三方存储库中找到 react-admin 的组件。

* [vascofg/react-admin-color-input](https://github.com/vascofg/react-admin-color-input): a color input using [React Color](http://casesandberg.github.io/react-color/), a collection of color pickers.
* [LoicMahieu/aor-tinymce-input](https://github.com/LoicMahieu/aor-tinymce-input): a TinyMCE component, useful for editing HTML
* [vascofg/react-admin-date-inputs](https://github.com/vascofg/react-admin-date-inputs): a collection of Date Inputs, based on [material-ui-pickers](https://material-ui-pickers.firebaseapp.com/)

## 编写自己的输入组件

如果您需要更具体的输入类型，您也可以自己编写。 您将不得不依赖 redux-form 的 [`<Field>`](http://redux-form.com/6.5.0/docs/api/Field.md/) 组件，以便处理值更新周期。

例如，让我们编写一个组件来编辑当前记录的纬度和经度：

```jsx
// in LatLongInput.js
import { Field } from 'redux-form';
const LatLngInput = () => (
    <span>
        <Field name="lat" component="input" type="number" placeholder="latitude" />
        &nbsp;
        <Field name="lng" component="input" type="number" placeholder="longitude" />
    </span>
);
export default LatLngInput;

// in ItemEdit.js
const ItemEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <LatLngInput />
        </SimpleForm>
    </Edit>
);
```

`LatLngInput` 不带任何属性，因为 `<Field>` 组件可以通过其上下文访问当前记录。 `name` 属性用作要编辑记录属性的选择器。 除 `name` 和 `component` 之外的所有 `Field` 属性都将传递给子组件/元素（该示例中的 `<input>`）。 执行此组件将大致呈现以下代码：

```html
<span>
    <input type="number" placeholder="longitude" value={record.lat} />
    <input type="number" placeholder="longitude" value={record.lng} />
</span>
```

**提示**：`<Field>` 组件支持 `name` 属性中的点表示法，以便编辑嵌套的属性：

```jsx
const LatLongInput = () => (
    <span>
        <Field name="position.lat" component="input" type="number" placeholder="latitude" />
        &nbsp;
        <Field name="position.lng" component="input" type="number" placeholder="longitude" />
    </span>
);
```

该组件缺少label。React-admin 为此提供了 `<Labeled>` 组件：

```jsx
// in LatLongInput.js
import { Field } from 'redux-form';
import { Labeled } from 'react-admin';

const LatLngInput = () => (
    <Labeled label="position">
        <span>
            <Field name="lat" component="input" type="number" placeholder="latitude" />
            &nbsp;
            <Field name="lng" component="input" type="number" placeholder="longitude" />
        </span>
    </Labeled>
);
export default LatLngInput;
```

现在组件将使用标签渲染：

```html
<label>Position</label>
<span>
    <input type="number" placeholder="longitude" value={record.lat} />
    <input type="number" placeholder="longitude" value={record.lng} />
</span>
```

您可以使用 material-ui 组件代替 HTML `input` 元素。 要编写 material-ui 和 `Field`，请使用 [field渲染器函数](http://redux-form.com/6.5.0/examples/material-ui/) 来映射属性：

```jsx
// in LatLongInput.js
import TextField from '@material-ui/core/TextField';
import { Field } from 'redux-form';
const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
    <TextField
        hintText={label}
        floatingLabelText={label}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);
const LatLngInput = () => (
    <span>
        <Field name="lat" component={renderTextField} label="latitude" />
        &nbsp;
        <Field name="lng" component={renderTextField} label="longitude" />
    </span>
);
```

Material-ui的 `<TextField>` 组件已包含 label，因此在这种情况下您不需要使用 `<Labeled>` 。 `<Field>` 为其子组件注入两个属性：`input` 和 `meta`。 要了解有关这些属性的更多信息，请参阅 redux-form 网站中的 [`<Field>`组件文档](http://redux-form.com/6.5.0/docs/api/Field.md/#props)。

**提示**：如果在自定义输入中只需要一个 `<Field>` 组件，则可以让 react-admin 使用 `addField` 高阶组件为您执行 `<Field>` 修饰：

```jsx
// in SexInput.js
import SelectField from '@material-ui/core/SelectField';
import MenuItem from '@material-ui/core/MenuItem';
import { addField } from 'react-admin';

const SexInput = ({ input, meta: { touched, error } }) => (
    <SelectField
        floatingLabelText="Sex"
        errorText={touched && error}
        {...input}
    >
        <MenuItem value="M" primaryText="Male" />
        <MenuItem value="F" primaryText="Female" />
    </SelectField>
);
export default addField(SexInput); // decorate with redux-form's <Field>

// equivalent of
import SelectField from '@material-ui/core/SelectField';
import MenuItem from '@material-ui/core/MenuItem';
import { Field } from 'redux-form';

const renderSexInput = ({ input, meta: { touched, error } }) => (
    <SelectField
        floatingLabelText="Sex"
        errorText={touched && error}
        {...input}
    >
        <MenuItem value="M" primaryText="Male" />
        <MenuItem value="F" primaryText="Female" />
    </SelectField>
);
const SexInput = ({ source }) => <Field name={source} component={renderSexInput} />
export default SexInput;
```

有关如何使用 redux-form `<Field>` 组件的更多详细信息，请参阅 [redux-form doc](http://redux-form.com/6.5.0/docs/api/Field.md/)。

Instead of HTML `input` elements or material-ui components, you can use react-admin input components, like `<NumberInput>` for instance. React-admin components are already decorated by `<Field>`, and already include a label, so you don't need either `<Field>` or `<Labeled>` when using them:

```jsx
// in LatLongInput.js
import { NumberInput } from 'react-admin';
const LatLngInput = () => (
    <span>
        <NumberInput source="lat" label="latitude" />
        &nbsp;
        <NumberInput source="lng" label="longitude" />
    </span>
);
export default LatLngInput;

// in ItemEdit.js
const ItemEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <DisabledInput source="id" />
            <LatLngInput />
        </SimpleForm>
    </Edit>
);
```

## Linking Two Inputs

Edition forms often contain linked inputs, e.g. country and city (the choices of the latter depending on the value of the former).

React-admin relies on redux-form, so you can grab the current form values using redux-form [formValueSelector()](https://redux-form.com/7.3.0/docs/api/formvalueselector.md/). Alternatively, you can use the react-admin `<FormDataConsumer>` component, which grabs the form values, and passes them to a child function.

This facilitates the implementation of linked inputs:

```jsx
import { FormDataConsumer } from 'react-admin';

const OrderEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <SelectInput source="country" choices={countries} />
            <FormDataConsumer>
                {({ formData, ...rest }) =>
                     <SelectInput 
                         source="city"
                         choices={getCitiesFor(formData.country)}
                         {...rest}
                     />
                }
            </FormDataConsumer>
        </SimpleForm>
    </Edit>
); 
```

## Hiding Inputs Based On Other Inputs

You may want to display or hide inputs base on the value of another input - for instance, show an `email` input only if the `hasEmail` boolean input is ticked to `true`.

For such cases, you can use the approach described above, using the `<FormDataConsumer>` component.

```jsx
import { FormDataConsumer } from 'react-admin';

 const PostEdit = (props) => (
     <Edit {...props}>
         <SimpleForm>
             <BooleanInput source="hasEmail" />
             <FormDataConsumer>
                 {({ formData, ...rest }) => formData.hasEmail &&
                      <TextInput source="email" {...rest} />
                 }
             </FormDataConsumer>
         </SimpleForm>
     </Edit>
 ); 
```