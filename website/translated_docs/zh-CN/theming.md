---
id: theming
title: Theming
---
无论您需要为单个组件调整CSS规则，还是更改整个应用程序中的标签颜色，都可以！

## 重写组件样式

每个 react-admin 组件都提供 `className` 属性，该属性始终应用于根元素。

下面是使用其 `className` 属性和 Material-UI 中的 `withStyles` 高阶组件自定义 `Datagrid` 中的 `EditButton` 组件的示例：

```jsx
import { NumberField, List, Datagrid, EditButton } from 'react-admin';
import { withStyles } from '@material-ui/core/styles';

const styles = {
    button: {
        fontWeight: 'bold',
        // This is JSS syntax to target a deeper element using css selector, here the svg icon for this button
        '& svg': { color: 'orange' }
    },
};

const MyEditButton = withStyles(styles)(({ classes, ...props }) => (
    <EditButton
        className={classes.button}
        {...props}
    />
));

export const ProductList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="sku" />
            <TextField source="price" />
            <MyEditButton />
        </Datagrid>
    </List>
);
```

对于某些组件，您可能不仅要覆盖根组件样式，还要覆盖根目录中组件的样式。 在这种情况下 `className` 属性是不够的。 您可以利用 `classes` 属性来自定义组件在内部使用的类。

下面是使用 `Filter` 和 `List` 组件的 `classes` 属性的示例：

```jsx
import React from 'react';
import {
    BooleanField,
    Datagrid,
    DateField,
    DateInput,
    EditButton,
    Filter,
    List,
    NullableBooleanInput,
    NumberField,
    TextInput,
} from 'react-admin';
import Icon from '@material-ui/icons/Person';
import { withStyles } from '@material-ui/core/styles';

export const VisitorIcon = Icon;

// The Filter component supports the `form` and `button` CSS classes. Here we override the `form` class
const filterStyles = {
    form: {
        backgroundColor: 'Lavender',
    },
};

const VisitorFilter = withStyles(filterStyles)(({ classes, ...props }) => (
    <Filter classes={classes} {...props}>
        <TextInput
            className={classes.searchInput}
            label="pos.search"
            source="q"
            alwaysOn
        />
        <DateInput source="last_seen_gte" />
        <NullableBooleanInput source="has_ordered" />
        <NullableBooleanInput source="has_newsletter" defaultValue />
    </Filter>
));

// The List component supports the `root`, `header`, `actions` and `noResults` CSS classes. Here we override the `header` and `actions` classes
const listStyles = {
    actions: {
        backgroundColor: 'Lavender',
    },
    header: {
        backgroundColor: 'Lavender',
    },
};

export const VisitorList = withStyles(listStyles)(({ classes, ...props }) => (
    <List
        classes={classes}
        {...props}
        filters={<VisitorFilter />}
        sort={{ field: 'last_seen', order: 'DESC' }}
        perPage={25}
    >
        <Datagrid classes={classes} {...props}>
            <DateField source="last_seen" type="date" />
            <NumberField
                source="nb_commands"
                label="resources.customers.fields.commands"
            />
            <NumberField
                source="total_spent"
                options={{ style: 'currency', currency: 'USD' }}
            />
            <DateField source="latest_purchase" showTime />
            <BooleanField source="has_newsletter" label="News." />
            <EditButton />
        </Datagrid>
    </List>
));
```

此示例导致：

![Visitor List with customized CSS classes](https://marmelab.com/react-admin/img/list_with_customized_css.png)

查看组件文档和源代码，了解哪些类可用于样式。 例如，您可以查看 [Datagrid CSS文档](./List.md#the-datagrid-component)。

如果您需要更多地控制 HTML 代码，您还可以创建自己的 [Field](./Fields.md#writing-your-own-field-component) 和 [Input](./Inputs.md#writing-your-own-input-component) 组件。

## 条件格式

有时您希望格式取决于值。 以下示例显示如何创建新的自定义 `NumberField` 组件，该组件在其值为100或更高时以红色突出显示其文本。

```jsx
import { NumberField, List, Datagrid, EditButton } from 'react-admin';
import { withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';

const coloredStyles = {
    small: { color: 'black' },
    big: { color: 'red' },
};

const ColoredNumberField = withStyles(coloredStyles)(
    ({ classes, ...props }) => (
        <NumberField
            className={classnames({
                [classes.small]: props.record[props.source] < 100,
                [classes.big]: props.record[props.source] >= 100,
            })}
            {...props}
        />
    ));

// Ensure the original component defaultProps are still applied as they may be used by its parents (such as the `Show` component):
ColoredNumberField.defaultProps = NumberField.defaultProps;

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            ...
            <ColoredNumberField source="nb_views" />
            <EditButton />
        </Datagrid>
    </List>
);
```

此外，如果您想将其重新用于其他组件，则可以将此突出显示策略提取到高阶组件中：

```jsx
import { NumberField, List, Datagrid, EditButton } from 'react-admin';
import { withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';

const coloredStyles = {
    small: { color: 'black' },
    big: { color: 'red' },
};

const colored = WrappedComponent => withStyles(coloredStyles)(
    ({ classes, ...props }) => (
        <WrappedComponent
            className={classnames({
                [classes.small]: props.record[props.source] < 500,
                [classes.big]: props.record[props.source] >= 500,
            })}
            {...props}
        />
    ));


const ColoredNumberField = colored(NumberField);
// Ensure the original component defaultProps are still applied as they may be used by its parents (such as the `Show` component):
ColoredNumberField.defaultProps = NumberField.defaultProps;

export const PostList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField source="id" />
            ...
            <ColoredNumberField source="nb_views" />
            <EditButton />
        </Datagrid>
    </List>
);
```

如果您想了解有关高阶组件的更多信息，请查看此SitePoint教程：[Higher Order Components: A React Application Design Pattern](https://www.sitepoint.com/react-higher-order-components/)

## Responsive Utility

要在移动设备，平板电脑和桌面设备上提供优化的体验，您通常需要根据屏幕大小显示不同的组件。 这就是 `<Responsive>` 组件的目的，它为响应式Web设计提供了一种声明式方法。

它期望元素道具命名为 `small`，`medium` 和 `large`。 它显示与屏幕大小匹配的元素（断点为768和992像素）：

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

**提示**：如果您只提供`small` 和 `medium`，则`medium`型元素也将用于大屏幕。 当省略 `small` 或 `medium` 时，存在相同类型的智能默认值。

提示：您可以将 null 指定为 `small`，`medium` 或 `large` 的值，以避免在特定大小上呈现某些内容而不会回退到其他大小。

提示：您还可以使用 [material-ui 的 `withWidth()` 高阶组件](https://github.com/callemall/material-ui/blob/master/src/utils/withWidth.js)，以便在您自己的组件中注入 `with` 属性。

## 使用预定义主题

Material UI 也支持开箱即用的 [complete theming](http://www.material-ui.com/#/customization/themes)。 Material UI提供两个基本主题：light 和 dark。 React-admin 默认使用 light。 要使用深色的, 请将 `theme` 属性传递到 `<Admin>` 组件（连同 `createMuiTheme()`）。

```jsx
import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    type: 'dark', // Switching the dark mode on is a single property value change.
  },
});

const App = () => (
    <Admin theme={theme} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

![Dark theme](https://marmelab.com/react-admin/img/dark-theme.png)

## 编写自定义主题

如果需要更精细的调优，则需要编写自己的 `theme` 对象, 以下是 [Material UI 主题文档](https://material-ui.com/customization/themes/)。 Material UI将自定义主题对象与默认主题合并。

```jsx
import { createMuiTheme } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';

const myTheme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: pink,
        error: red,
        contrastThreshold: 3,
        tonalOffset: 0.2,
    },
    typography: {
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
    overrides: {
        MuiButton: { // override the styles of all instances of this component
            root: { // Name of the rule
                color: 'white', // Some CSS
            },
        },
    },
});
```

MuiTheme 对象包含以下键：

* `breakpoints`
* `direction`
* `mixins`
* `overrides`
* `palette`
* `props`
* `shadows`
* `typography`
* `transitions`
* `spacing`
* `zIndex`

**提示**：查看 [Material UI默认主题文档](https://material-ui.com/customization/default-theme/) 以查看这些键的默认值和含义。

定义主题后，将其传递给 `<Admin>` 组件的 `theme` 属性中。

```jsx
const App = () => (
    <Admin theme={myTheme} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

## 使用自定义布局

您可以使用自己的组件作为 admin 布局，而不是默认布局。 只需使用 `<Admin>` 组件的 appLayout 属性：

```jsx
// in src/App.js
import MyLayout from './MyLayout';

const App = () => (
    <Admin appLayout={MyLayout} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

如果您只想覆盖 appBar，menu 或 notification 组件，则自定义布局可以扩展默认的 `<Layout>` 组件。 例如：

```jsx
// in src/MyLayout.js
import { Layout } from 'react-admin';
import MyAppBar from './MyAppBar';
import MyMenu from './MyMenu';
import MyNotification from './MyNotification';

const MyLayout = (props) => <Layout 
    {...props}
    appBar={MyAppBar}
    menu={MyMenu}
    notification={MyNotification}
/>;

export default MyLayout;
```

要获得更多自定义布局，请从头开始编写组件。 它必须包含 `{children}` 占位符, 其中就是 react-admin 将渲染的资源。 使用 [default layout](https://github.com/marmelab/react-admin/blob/master/src/mui/layout/Layout.js) 作为起点。 下面是一个简化版本 (没有 responsive 支持):

```jsx
// in src/MyLayout.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {
    AppBar,
    Menu,
    Notification,
    Sidebar,
    setSidebarVisibility,
} from 'react-admin';

const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1,
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
    },
    appFrame: {
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'auto',
    },
    contentWithSidebar: {
        display: 'flex',
        flexGrow: 1,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 2,
        padding: theme.spacing.unit * 3,
        marginTop: '4em',
        paddingLeft: 5,
    },
});

class MyLayout extends Component {
    componentWillMount() {
        this.props.setSidebarVisibility(true);
    }

    render() {
        const {
            children,
            classes,
            dashboard,
            isLoading,
            logout,
            open,
            title,
        } = this.props;
        return (
            <div className={classes.root}>
                <div className={classes.appFrame}>
                    <AppBar title={title} open={open} logout={logout} />
                    <main className={classes.contentWithSidebar}>
                        <Sidebar>
                            <Menu logout={logout} hasDashboard={!!dashboard} />
                        </Sidebar>
                        <div className={classes.content}>
                            {children}
                        </div>
                    </main>
                    <Notification />
                </div>
            </div>
        );
    }
}

MyLayout.propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    dashboard: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
    ]),
    isLoading: PropTypes.bool.isRequired,
    logout: componentPropType,
    setSidebarVisibility: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({ isLoading: state.admin.loading > 0 });
export default connect(mapStateToProps, { setSidebarVisibility })(withStyles(styles)(MyLayout));
```

## 使用自定义菜单

默认情况下，React-admin 使用作为 `<Admin>` 子级传递的 `<Resource>` 组件列表来为具有 `list` 组件的每个资源构建菜单。

如果要添加或删除菜单项，例如链接到非资源页面，可以创建自己的菜单组件：

```jsx
// in src/MyMenu.js
import React from 'react';
import { connect } from 'react-redux';
import { MenuItemLink, getResources } from 'react-admin';
import { withRouter } from 'react-router-dom';
import Responsive from '../layout/Responsive';

const MyMenu = ({ resources, onMenuClick, logout }) => (
    <div>
        {resources.map(resource => (
            <MenuItemLink to={`/${resource.name}`} primaryText={resource.name} onClick={onMenuClick} />
        ))}
        <MenuItemLink to="/custom-route" primaryText="Miscellaneous" onClick={onMenuClick} />
        <Responsive
            small={logout}
            medium={null} // Pass null to render nothing on larger devices
        />
    </div>
);

const mapStateToProps = state => ({
    resources: getResources(state),
});

export default withRouter(connect(mapStateToProps)(MyMenu));

```

**提示**：请注意 `MenuItemLink` 组件。 必须使用它来避免移动视图中不必要的副作用。

**提示**：注意, 我们只在小设备上包含 ` logout ` 项。实际上, ` logout ` 按钮已显示在较大设备的 AppBar 中。

**提示**：请注意，我们使用React Router [`withRouter`](https://reacttraining.com/react-router/web/api/withRouter) Hoc，并在Redux [connect](https://github.com/reactjs/react-redux/blob/master/docs/api.html#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) **之前**使用它。 如果要突出显示活动菜单项，则需要这样做。

要使用此自定义菜单组件，请将其传递给自定义布局，如上所述：

```jsx
// in src/MyLayout.js
import { Layout } from 'react-admin';
import MyMenu from './MyMenu';

const MyLayout = (props) => <Layout {...props} menu={MyMenu} />;

export default MyLayout;
```

然后，在 `<Admin>` `applayout` 属性中使用此布局：

```jsx
// in src/App.js
import MyLayout from './MyLayout';

const App = () => (
    <Admin appLayout={MyLayout} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

**提示**：如果您使用 authentication，请不要忘记在自定义菜单组件中渲染` logout `属性。 此外，作为属性传递的 `onMenuClick` 函数用于关闭移动设备上的侧边栏。

`MenuItemLink` 组件使用 React Router `NavLink` 组件，因此允许在定位当前页面时自定义其样式。</p> 

如果默认的活动样式不符合您的喜好，您可以通过传递自己的 `classes` 来覆盖它：

```jsx
// in src/MyMenu.js
import React from 'react';
import { connect } from 'react-redux';
import { MenuItemLink, getResources } from 'react-admin';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';

const styles = {
    root: {}, // Style applied to the MenuItem from material-ui
    active: { fontWeight: 'bold' }, // Style applied when the menu item is the active one
    icon: {}, // Style applied to the icon
};

const MyMenu = ({ classes, resources, onMenuClick, logout }) => (
    <div>
        {resources.map(resource => (
            <MenuItemLink classes={classes} to={`/${resource.name}`} primaryText={resource.name} onClick={onMenuClick} />
        ))}
        <MenuItemLink classes={classes} to="/custom-route" primaryText="Miscellaneous" onClick={onMenuClick} />
        <Responsive
            small={logout}
            medium={null} // Pass null to render nothing on larger devices
        />
    </div>
);

const mapStateToProps = state => ({
    resources: getResources(state),
});

export default withRouter(connect(mapStateToProps)(withStyles(styles)(Menu)));
```

## Notifications

如果您使用自己的layout（或自定义登录页面），则可能使用 `<Notification>` 组件。

您可以通过设置 `autoHideDuration` 属性来重写通知持续时间。 它默认为4000，即4秒。 例如，要创建一个默认为5秒的自定义通知组件：

```jsx
// in src/MyNotification.js
import { Notification } from 'react-admin';

const MyNotification = props => <Notification {...props}autoHideDuration={5000} />;

export default MyNotification;
```

**提示**：如果您使用 `showNotification` action，则可以将每条消息的 `autoHideDuration` 定义为 `showNotification` action创建者的第三个参数。

## Loading

显示带有可选消息的循环进度组件。 在自定义页面上显示与 `react-admin` 相同的加载组件以保持一致性。

Supported props:

| Prop               | Type     | Default              | Descriptions                               |
| ------------------ | -------- | -------------------- | ------------------------------------------ |
| `loadingPrimary`   | `String` | `ra.page.loading`    | Label to use for primary loading message   |
| `loadingSecondary` | `String` | `ra.message.loading` | Label to use for secondary loading message |

Usage:

```jsx
<Loading loadingPrimary="app.page.loading" loadingSecondary="app.message.loading" />
```

## LinearProgress

Display a linear progress component. Display the same loading component as `react-admin` on custom inputs for consistency.

Usage:

```jsx
({ data, ...props }) => !data? 
        <LinearProgress /> : 
        <MyInput data={data} />        
```