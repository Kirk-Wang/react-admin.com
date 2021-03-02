---
id: faq
title: 常见问题
---

- [是否可以为资源提供自定义标识符/主键？](#can-i-have-custom-identifiersprimary-keys-for-my-resources)
- [我收到关于数组中子项的唯一键的警告](#i-get-warning-about-unique-key-for-child-in-array)
- [呈现时冻结验证的表单](#a-form-with-validation-freezes-when-rendering)
- [如何根据用户权限自定义 UI？](#how-can-i-customize-the-ui-depending-on-the-user-permissions)
- [如何根据输入值来自定义表单？](#how-can-i-customize-forms-depending-on-its-inputs-values)

## 是否可以为资源提供自定义标识符/主键？

React-admin 需要每个资源都有一个 `id` field来标识它。 如果您的 API 为主键使用不同的名称，则必须将该名称映射到自定义 [dataProvider](./DataProviders.md) 中的 `id`。 例如，要使用名为 `_id` 的字段作为标识符：

```js
const convertHTTPResponse = (response, type, resource, params) => {
    const { headers, json } = response;
    switch (type) {
    case GET_LIST:
        return {
            data: json.map(resource => ({ ...resource, id: resource._id }) ),
            total: parseInt(headers.get('content-range').split('/').pop(), 10),
        };
    case UPDATE:
    case DELETE:
    case GET_ONE:
        return { ...json, id: json._id }; 
    case CREATE:
        return { ...params.data, id: json._id };
    default:
        return json;
    }
};
```

## 我收到关于数组中子项的唯一键的警告

当显示`Datagrid`组件时，您将得到以下警告：

> 警告: 数组或迭代器中的每个子元素都应该有一个唯一的 “key” 属性。检查DatagridBody的渲染方法。

这很可能是因为资源没有 react-admin 所期望的 `id` 属性。 请参阅上一个常见问题解答以了解如何解决此问题：[我可以为自己的资源设置自定义标识符/主键吗？](#can-i-have-custom-identifiersprimary-keys-for-my-resources)

## 呈现时冻结验证的表单

您可能直接在组件的 render 方法中使用验证器工厂：

```jsx
export const CommentEdit = ({ ...props }) => (
    <Edit {...props}>
        <SimpleForm>
            <DisabledInput source="id" />
            <DateInput source="created_at" />
            <LongTextInput source="body" validate={minLength(10)} />
        </SimpleForm>
    </Edit>
);
```

避免直接在render方法中调用函数：

```jsx
const validateMinLength = minLength(10);

export const CommentEdit = ({ ...props }) => (
    <Edit {...props}>
        <SimpleForm>
            <DisabledInput source="id" />
            <DateInput source="created_at" />
            <LongTextInput source="body" validate={validateMinLength} />
        </SimpleForm>
    </Edit>
);
```

这与 [redux-form](https://github.com/erikras/redux-form/issues/3288) 有关。

## 如何根据用户权限自定义 UI？

一些相当常见的用例可能依赖于用户权限：

- 特定视图
- 视图（字段，输入）的部分对于特定用户而言是不同的
- 隐藏或显示菜单项

对于所有这些情况，您可以使用 [aor-permissions](https://github.com/marmelab/aor-permissions) 插件。

## 如何根据输入值来自定义表单？

一些用例：

- 如果另一个输入有一个值，则显示/隐藏某些输入
- 如果另一个输入具有特定值，则显示/隐藏某些输入
- 如果当前表单值与特定约束匹配，则显示/隐藏某些输入

对于所有这些情况，您可以使用 [aor-dependent-input](https://github.com/marmelab/aor-dependent-input) 插件。