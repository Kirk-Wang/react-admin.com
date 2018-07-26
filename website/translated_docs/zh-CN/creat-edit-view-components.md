---
layout: creat-edit-view-components
title: <Create> and <Edit> Views
---
“创建”和“编辑”视图都显示一个表单，使用空记录初始化的（对于“创建视图”）或具有一条从API（对于“编辑”视图）获取的记录。 `<Create>` 和 `<Edit>` 组件然后将表单的实际渲染委托给表单组件 - 通常是 `<SimpleForm>`。 此表单组件使用其子级 ([`<Input>`](./Inputs.md) 组件) 来呈现每个 from input。

![post creation form](https://marmelab.com/react-admin/img/create-view.png)

![post edition form](https://marmelab.com/react-admin/img/edit-view.png)

## `Create` 和 `Edit` 组件

`<Create>` 和 `<Edit>` 组件渲染页面标题和操作，并从 Data Provider 获取记录。 他们不负责渲染实际的表单 - 这是他们的子组件（通常是 `<SimpleForm>`）的工作，他们将 `record` 作为属性传递给它们。

这里是 `<Create>` 和 `<Edit>` 组件接受的所有属性：

* [`title`](#page-title)
* [`actions`](#actions)

以下是显示一个表单来创建和编辑评论所需的最少代码：

```jsx
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';

import { PostCreate, PostEdit } from './posts';

const App = () => (
    <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
        <Resource name="posts" create={PostCreate} edit={PostEdit} />
    </Admin>
);

export default App;

// in src/posts.js
import React from 'react';
import { Create, Edit, SimpleForm, DisabledInput, TextInput, DateInput, LongTextInput, ReferenceManyField, Datagrid, TextField, DateField, EditButton } from 'react-admin';
import RichTextInput from 'ra-input-rich-text';

export const PostCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="title" />
            <TextInput source="teaser" options={{ multiLine: true }} />
            <RichTextInput source="body" />
            <DateInput label="Publication date" source="published_at" defaultValue={new Date()} />
        </SimpleForm>
    </Create>
);

export const PostEdit = (props) => (
    <Edit title={<PostTitle />} {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput source="title" validate={required()} />
            <LongTextInput source="teaser" validate={required()} />
            <RichTextInput source="body" validate={required()} />
            <DateInput label="Publication date" source="published_at" />
            <ReferenceManyField label="Comments" reference="comments" target="post_id">
                <Datagrid>
                    <TextField source="body" />
                    <DateField source="created_at" />
                    <EditButton />
                </Datagrid>
            </ReferenceManyField>
        </SimpleForm>
    </Edit>
);
```

这足以显示 post 编辑表单：

![post edition form](https://marmelab.com/react-admin/img/post-edition.png)

**提示**：您可能会发现为 `<Create>` 和 `<Edit>` 视图重复相同的 input 组件很麻烦。 实际上，这两个视图几乎从来没有完全相同的表单输入。 例如，在以前的代码片段中， `<Edit>` 视图显示了对当前帖子的相关评论，这对于新的帖子是没有意义的。 因此，为两个视图拥有两组单独的输入组件是一个有意的选择。 但是，如果您具有相同的输入组件集，则将它们导出为自定义Form组件以避免重复。

`< Create> ` 接受 `record` 属性，以基于值对象初始化表单。

### 页面标题

默认情况下，"创建" 视图的标题为 "创建 [resource_name]"，编辑视图的标题为 "编辑 [resource_name] #[record_id]"。

您可以通过指定一个自定义 `title` 属性来自定义此标题：

```jsx
export const PostEdit = (props) => (
    <Edit title="Post edition" {...props}>
        ...
    </Edit>
);
```

更有趣的是，你可以通过传递一个组件作为 `title`。 React-admin 克隆此组件，并在 `<EditView>` 中注入当前 `record`。 这允许根据当前记录自定义标题：

```jsx
const PostTitle = ({ record }) => {
    return <span>Post {record ? `"${record.title}"` : ''}</span>;
};
export const PostEdit = (props) => (
    <Edit title={<PostTitle />} {...props}>
        ...
    </Edit>
);
```

### Actions

你可以通过你自己的元素使用 `actions` 属性来替换默认 action 列表：

```jsx
import Button from '@material-ui/core/Button';
import {
    CardActions,
    ListButton,
    ShowButton,
    DeleteButton,
    RefreshButton,
} from 'react-admin';

const PostEditActions = ({ basePath, data, resource }) => (
    <CardActions>
        <ShowButton basePath={basePath} record={data} />
        <ListButton basePath={basePath} />
        <DeleteButton basePath={basePath} record={data} resource={resource} />
        <RefreshButton />
        {/* Add your custom actions */}
        <Button color="primary" onClick={customAction}>Custom Action</Button>
    </CardActions>
);

export const PostEdit = (props) => (
    <Edit actions={<PostEditActions />} {...props}>
        ...
    </Edit>
);
```

如果要阻止 admin 删除，使用自定义` EditActions `组件还允许删除`< DeleteButton > `。

## 预填充`创建`记录

默认情况下，`<Create>` 视图以空 `record` 开头。可以通过自定义 `record` 对象来从预设值开始：

```jsx
const commentDefaultValue = { nb_views: 0 };
export const CommentCreate = (props) => (
    <Create {...props} record={commentDefaultValue}>
        <SimpleForm>
            <TextInput source="author" />
            <RichTextInput source="body" />
            <NumberInput source="nb_views" />
        </SimpleForm>
    </Create>
);
```

在这里使用 `record` 设置默认值时，它不适用于 `<Edit>`。 因此，建议在 Form 组件中使用 [ `defaultValue`](#default-values) 属性代替。

但是，有一个有效的用例来预置` record ` 属性：根据相关记录预填充记录。 例如，在` PostShow `组件中，您可能希望显示一个按钮来创建与当前帖子相关的评论，这将导致` CommentCreate `页面中的` post_id `已预设。

要启用此项，必须首先更新 `CommentCreate` 组件，以从 `location` 对象中读取记录 (由 react-router 注入)：

```diff
const commentDefaultValue = { nb_views: 0 };
-export const CommentCreate = (props) => (
+export const CommentCreate = ({ location, ...props}) => (
-   <Create {...props}>
+   <Create
+       record={(location.state && location.state.record) || defaultValue}
+       location={location}
+       {...props}
+   >
       <SimpleForm>
            <TextInput source="author" />
            <RichTextInput source="body" />
            <NumberInput source="nb_views" />
        </SimpleForm>
    </Create>
);
```

要设置此`location.state`，您必须使用 react-router 的 `<Link>` 组件创建链接或按钮：

```jsx
// in PostShow.js
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

const CreateRelatedCommentButton = ({ record }) => (
    <Button
        component={Link}
        to={{
            pathname: '/comments/create',
            state: { record: { post_id: record.id } },
        }}
    >
        Write a comment for that post
    </Button>
);

export default PostShow = props => (
    <Show {...props}>
        <SimpleShowLayout>
            ...
            <CreateRelatedCommentButton />
        </SimpleShowLayout>
    </Show>
)
```

**提示**：要使用 material-ui 主题中的主要颜色设置样式，请使用` react-admin `包中的` Link `组件，而不是来自` react-router `的那个。

## `SimpleForm` 组件

`<SimpleForm>` 组件从其父组件接收 `record` 作为属性。 它负责渲染实际的表单。 它还负责验证表单数据。 最后，它收到一个 `handleSubmit` 函数作为属性，当用户提交表单时，以更新的记录作为参数调用。

`< SimpleForm> `逐行呈现其子组件（在`< div> `组件中）。 它使用` redux-form `。

![post edition form](https://marmelab.com/react-admin/img/post-edition.png)

默认情况下, `<SimpleForm>` 在用户按 `ENTER` 时提交表单。 如果您想要改变这种行为，你可以传递 `false` 给 `submitOnEnter` 属性。 如果您有一个使用 `ENTER` 的输入小部件来进行特殊的功能，这可能很有用。

以下是 `<SimpleForm>` 组件所接受的所有属性：

* [`defautValue`](#default-values)
* [`validate`](#validation)
* [`submitOnEnter`](#submit-on-enter)
* [`redirect`](#redirection-after-submission)
* [`toolbar`](#toolbar)
* `save`: The function invoked when the form is submitted. This is passed automatically by `react-admin` when the form component is used inside `Create` and `Edit` components.
* `saving`: A boolean indicating whether a save operation is ongoing. This is passed automatically by `react-admin` when the form component is used inside `Create` and `Edit` components.
* `form`: The name of the [`redux-form`](https://redux-form.com/7.4.2/docs/api/reduxform.md/#-code-form-string-code-required-). It defaults to `record-form` and should only be modified when using the `SimpleForm` outside of a `Create` or `Edit` component.

```jsx
export const PostCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="title" />
            <RichTextInput source="body" />
            <NumberInput source="nb_views" />
        </SimpleForm>
    </Create>
);
```

## `TabbedForm` 组件

就像 `<SimpleForm>` 一样， `<TabbedForm>` 接收 `record` 属性，渲染实际的表单，并在提交上处理表单验证。 但是，`<TabbedForm>` 组件会按选项卡渲染 input。 这些选项卡通过使用 `<FormTab>` 组件设置，该组件期望一个`label` 和一个 `icon` 属性。

![tabbed form](https://marmelab.com/react-admin/img/tabbed-form.gif)

默认情况下，当用户按 `ENTER` 键时 `<TabbedForm>` 提交表单，如果要更改此行为，你可以为 `submitOnEnter` 属性传递 `false`。

以下是 `<TabbedForm>` 组件所接受的所有属性：

* [`defautValue`](#default-values)
* [`validate`](#validation)
* [`submitOnEnter`](#submit-on-enter)
* [`redirect`](#redirection-after-submission)
* [`toolbar`](#toolbar)
* `save`: The function invoked when the form is submitted. This is passed automatically by `react-admin` when the form component is used inside `Create` and `Edit` components.
* `saving`: A boolean indicating whether a save operation is ongoing. This is passed automatically by `react-admin` when the form component is used inside `Create` and `Edit` components.
* `form`: The name of the [`redux-form`](https://redux-form.com/7.4.2/docs/api/reduxform.md/#-code-form-string-code-required-). It defaults to `record-form` and should only be modified when using the `TabbedForm` outside of a `Create` or `Edit` component.

```jsx
import { TabbedForm, FormTab } from 'react-admin'

export const PostEdit = (props) => (
    <Edit {...props}>
        <TabbedForm>
            <FormTab label="summary">
                <DisabledInput label="Id" source="id" />
                <TextInput source="title" validate={required()} />
                <LongTextInput source="teaser" validate={required()} />
            </FormTab>
            <FormTab label="body">
                <RichTextInput source="body" validate={required()} addLabel={false} />
            </FormTab>
            <FormTab label="Miscellaneous">
                <TextInput label="Password (if protected post)" source="password" type="password" />
                <DateInput label="Publication date" source="published_at" />
                <NumberInput source="average_note" validate={[ number(), minValue(0) ]} />
                <BooleanInput label="Allow comments?" source="commentable" defaultValue />
                <DisabledInput label="Nb views" source="views" />
            </FormTab>
            <FormTab label="comments">
                <ReferenceManyField reference="comments" target="post_id" addLabel={false}>
                    <Datagrid>
                        <TextField source="body" />
                        <DateField source="created_at" />
                        <EditButton />
                    </Datagrid>
                </ReferenceManyField>
            </FormTab>
        </TabbedForm>
    </Edit>
);
```

## Default Values

To define default values, you can add a `defaultValue` prop to form components (`<SimpleForm>`, `<Tabbedform>`, etc.), or add a `defaultValue` to individual input components. Let's see each of these options.

### Global Default Value

The value of the form `defaultValue` prop can be an object, or a function returning an object, specifying default values for the created record. For instance:

```jsx
const postDefaultValue = { created_at: new Date(), nb_views: 0 };
export const PostCreate = (props) => (
    <Create {...props}>
        <SimpleForm defaultValue={postDefaultValue}>
            <TextInput source="title" />
            <RichTextInput source="body" />
            <NumberInput source="nb_views" />
        </SimpleForm>
    </Create>
);
```

**Tip**: You can include properties in the form `defaultValue` that are not listed as input components, like the `created_at` property in the previous example.

### Per Input Default Value

Alternatively, you can specify a `defaultValue` prop directly in `<Input>` components. Just like for form-level default values, an input-level default value can be a scalar, or a function returning a scalar. React-admin will merge the input default values with the form default value (input > form):

```jsx
export const PostCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <DisabledInput source="id" defaultValue={() => uuid()}/>
            <TextInput source="title" />
            <RichTextInput source="body" />
            <NumberInput source="nb_views" defaultValue={0} />
        </SimpleForm>
    </Create>
);
```

## Validation

React-admin relies on [redux-form](http://redux-form.com/) for the validation.

To validate values submitted by a form, you can add a `validate` prop to the form component, to individual inputs, or even mix both approaches.

### Global Validation

The value of the form `validate` prop must be a function taking the record as input, and returning an object with error messages indexed by field. For instance:

```jsx
const validateUserCreation = (values) => {
    const errors = {};
    if (!values.firstName) {
        errors.firstName = ['The firstName is required'];
    }
    if (!values.age) {
        errors.age = ['The age is required'];
    } else if (values.age < 18) {
        errors.age = ['Must be over 18'];
    }
    return errors
};

export const UserCreate = (props) => (
    <Create {...props}>
        <SimpleForm validate={validateUserCreation}>
            <TextInput label="First Name" source="firstName" />
            <TextInput label="Age" source="age" />
        </SimpleForm>
    </Create>
);
```

**Tip**: The props you pass to `<SimpleForm>` and `<TabbedForm>` end up as `reduxForm()` parameters. This means that, in addition to `validate`, you can also pass `warn` or `asyncValidate` functions. Read the [`reduxForm()` documentation](http://redux-form.com/6.5.0/docs/api/ReduxForm.md/) for details.

### Per Input Validation: Function Validator

Alternatively, you can specify a `validate` prop directly in `<Input>` components, taking either a function, or an array of functions. These functions should return `undefined` when there is no error, or an error string.

```jsx
const required = (message = 'Required') =>
    value => value ? undefined : message;
const maxLength = (max, message = 'Too short') =>
    value => value && value.length > max ? message : undefined;
const number = (message = 'Must be a number') =>
    value => value && isNaN(Number(value)) ? message : undefined;
const minValue = (min, message = 'Too small') =>
    value => value && value < min ? message : undefined;

const ageValidation = (value, allValues) => {
    if (!value) {
        return 'The age is required';
    }
    if (value < 18) {
        return 'Must be over 18';
    }
    return [];
}

const validateFirstName = [required(), maxLength(15)];
const validateAge = [required(), number(), ageValidation];

export const UserCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput label="First Name" source="firstName" validate={validateFirstName} />
            <TextInput label="Age" source="age" validate={validateAge}/>
        </SimpleForm>
    </Create>
);
```

React-admin will combine all the input-level functions into a single function looking just like the previous one.

Input validation functions receive the current field value, and the values of all fields of the current record. This allows for complex validation scenarios (e.g. validate that two passwords are the same).

**Tip**: Validator functions receive the form `props` as third parameter, including the `translate` function. This lets you build internationalized validators:

```jsx
const required = (message = 'myroot.validation.required') => 
    (value, allValues, props) => value ? undefined : props.translate(message);
```

**Tip**: Make sure to define validation functions or array of functions in a variable, instead of defining them directly in JSX. This can result in a new function or array at every render, and trigger infinite rerender.

```jsx
const validateStock = [required(), number(), minValue(0)];

export const ProductEdit = ({ ...props }) => (
    <Edit {...props}>
        <SimpleForm defaultValue={{ stock: 0 }}>
            ...
            {/* do this */}
            <NumberInput source="stock" validate={validateStock} />
            {/* don't do that */}
            <NumberInput source="stock" validate={[required(), number(), minValue(0)]} />
            ...
        </SimpleForm>
    </Edit>
);
```

**Tip**: The props of your Input components are passed to a redux-form `<Field>` component. So in addition to `validate`, you can also use `warn`.

**Tip**: You can use *both* Form validation and input validation.

### Built-in Field Validators

React-admin already bundles a few validator functions, that you can just require, and use as input-level validators:

* `required(message)` if the field is mandatory,
* `minValue(min, message)` to specify a minimum value for integers,
* `maxValue(max, message)` to specify a maximum value for integers,
* `minLength(min, message)` to specify a minimum length for strings,
* `maxLength(max, message)` to specify a maximum length for strings,
* `number(message)` to check that the input is a valid number,
* `email(message)` to check that the input is a valid email address,
* `regex(pattern, message)` to validate that the input matches a regex,
* `choices(list, message)` to validate that the input is within a given list,

Example usage:

```jsx
import { 
    required,
    minLength,
    maxLength,
    minValue,
    maxValue,
    number,
    regex,
    email,
    choices
} from 'react-admin';

const validateFirstName = [required(), minLength(2), maxLength(15)];
const validateEmail = email();
const validateAge = [number(), minValue(18)];
const validateZipCode = regex(/^\d{5}$/, 'Must be a valid Zip Code');
const validateSex = choices(['m', 'f'], 'Must be Male or Female');

export const UserCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput label="First Name" source="firstName" validate={validateFirstName} />
            <TextInput label="Email" source="email" validate={validateEmail} />
            <TextInput label="Age" source="age" validate={validateAge}/>
            <TextInput label="Zip Code" source="zip" validate={validateZipCode}/>
            <SelectInput label="Sex" source="sex" choices={[
                { id: 'm', name: 'Male' },
                { id: 'f', name: 'Female' },
            ]} validate={validateSex}/>
        </SimpleForm>
    </Create>
);
```

**Tip**: If you pass a function as a message, react-admin calls this function with `{ args, value, values,translate, ...props }` as argument. For instance:

```jsx
const message = ({ translate }) => translate('myroot.validation.email_invalid');
const validateEmail = email(message);
```

## Submit On Enter

By default, pressing `ENTER` in any of the form fields submits the form - this is the expected behavior in most cases. However, some of your custom input components (e.g. Google Maps widget) may have special handlers for the `ENTER` key. In that case, to disable the automated form submission on enter, set the `submitOnEnter` prop of the form component to `false`:

```jsx
export const PostEdit = (props) => (
    <Edit {...props}>
        <SimpleForm submitOnEnter={false}>
            ...
        </SimpleForm>
    </Edit>
);
```

## Redirection After Submission

By default:

* Submitting the form in the `<Create>` view redirects to the `<Edit>` view
* Submitting the form in the `<Edit>` view redirects to the `<List>` view

You can customize the redirection by setting the `redirect` prop of the form component. Possible values are "edit", "show", "list", and `false` to disable redirection. You may also specify a custom path such as `/my-custom-route`. For instance, to redirect to the `<Show>` view after edition:

```jsx
export const PostEdit = (props) => (
    <Edit {...props}>
        <SimpleForm redirect="show">
            ...
        </SimpleForm>
    </Edit>
);
```

You can also pass a custom route (e.g. "/home") or a function as `redirect` prop value. For example, if you want to redirect to a page related to the current object:

```jsx
// redirect to the related Author show page
const redirect = (basePath, id, data) => `/author/${data.author_id}/show`;

export const PostEdit = (props) => {
    <Edit {...props}>
        <SimpleForm redirect={redirect}>
            ...
        </SimpleForm>
    </Edit>
);
```

This affects both the submit button, and the form submission when the user presses `ENTER` in one of the form fields.

## Toolbar

At the bottom of the form, the toolbar displays the submit button. You can override this component by setting the `toolbar` prop, to display the buttons of your choice.

The most common use case is to display two submit buttons in the `<Create>` view:

* one that creates and redirects to the `<Show>` view of the new resource, and
* one that redirects to a blank `<Create>` view after creation (allowing bulk creation)

![Form toolbar](https://marmelab.com/react-admin/img/form-toolbar.png)

For that use case, use the `<SaveButton>` component with a custom `redirect` prop:

```jsx
import { Edit, SimpleForm, SaveButton, Toolbar } from 'react-admin';

const PostCreateToolbar = props => (
    <Toolbar {...props} >
        <SaveButton
            label="post.action.save_and_show"
            redirect="show"
            submitOnEnter={true}
        />
        <SaveButton
            label="post.action.save_and_add"
            redirect={false}
            submitOnEnter={false}
            variant="flat"
        />
    </Toolbar>
);

export const PostEdit = (props) => (
    <Edit {...props}>
        <SimpleForm toolbar={<PostCreateToolbar />} redirect="show">
            ...
        </SimpleForm>
    </Edit>
);
```

Here are the props received by the `Toolbar` component when passed as the `toolbar` prop of the `SimpleForm` or `TabbedForm` components:

* `handleSubmitWithRedirect`: The function to call in order to submit the form. It accepts a single parameter overriding the form's default redirect.
* `invalid`: A boolean indicating whether the form is invalid
* `pristine`: A boolean indicating whether the form is pristine (eg: no inputs have been changed yet)
* `redirect`: The default form's redirect
* `saving`: A boolean indicating whether a save operation is ongoing.
* `submitOnEnter`: A boolean indicating whether the form should be submitted when pressing `enter`

**Tip**: Use react-admin's `<Toolbar>` component instead of material-ui's `<Toolbar>` component. The former builds up on the latter, and adds support for an alternative mobile layout (and is therefore responsive).

**Tip**: Don't forget to also set the `redirect` prop of the Form component to handle submission by the `ENTER` key.

## Customizing Input Container Styles

The input components are wrapped inside a `div` to ensure a good looking form by default. You can pass a `formClassName` prop to the input components to customize the style of this `div`. For example, here is how to display two inputs on the same line:

```jsx
const styles = {
    inlineBlock: { display: 'inline-flex', marginRight: '1rem' },
};
export const UserEdit = withStyles(styles)(({ classes, ...props }) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="first_name" formClassName={classes.inlineBlock} />
            <TextInput source="last_name" formClassName={classes.inlineBlock} />
            {/* This input will be display below the two first ones */}
            <TextInput source="email" type="email" />
        </SimpleForm>
    </Edit>
```

## Displaying Fields or Inputs depending on the user permissions

You might want to display some fields, inputs or filters only to users with specific permissions. Those permissions are retrieved for each route and will provided to your component as a `permissions` prop.

Each route will call the `authProvider` with the `AUTH_GET_PERMISSIONS` type and some parameters including the current location and route parameters. It's up to you to return whatever you need to check inside your component such as the user's role, etc.

Here's an example inside a `Create` view with a `SimpleForm` and a custom `Toolbar`:

```jsx
const UserCreateToolbar = ({ permissions, ...props }) =>
    <Toolbar {...props}>
        <SaveButton
            label="user.action.save_and_show"
            redirect="show"
            submitOnEnter={true}
        />
        {permissions === 'admin' &&
            <SaveButton
                label="user.action.save_and_add"
                redirect={false}
                submitOnEnter={false}
                variant="flat"
            />}
    </Toolbar>;

export const UserCreate = ({ permissions, ...props }) =>
    <Create {...props}>
        <SimpleForm
            toolbar={<UserCreateToolbar permissions={permissions} />}
            defaultValue={{ role: 'user' }}
        >
            <TextInput source="name" validate={[required()]} />
            {permissions === 'admin' &&
                <TextInput source="role" validate={[required()]} />}
        </SimpleForm>
    </Create>;
```

**Tip**: Note how the `permissions` prop is passed down to the custom `toolbar` component.

This also works inside an `Edition` view with a `TabbedForm`, and you can hide a `FormTab` completely:

```jsx
export const UserEdit = ({ permissions, ...props }) =>
    <Edit title={<UserTitle />} {...props}>
        <TabbedForm defaultValue={{ role: 'user' }}>
            <FormTab label="user.form.summary">
                {permissions === 'admin' && <DisabledInput source="id" />}
                <TextInput source="name" validate={required()} />
            </FormTab>
            {permissions === 'admin' &&
                <FormTab label="user.form.security">
                    <TextInput source="role" validate={required()} />
                </FormTab>}
        </TabbedForm>
    </Edit>;
```