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

Material UI 也支持开箱即用的 [complete theming](http://www.material-ui.com/#/customization/themes)。 Material UI提供两个基本主题：light 和 dark。 React-admin 默认使用 light。 To use the dark one, pass it to the `<Admin>` component, in the `theme` prop (along with `createMuiTheme()`).

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

## Writing a Custom Theme

If you need more fine tuning, you'll need to write your own `theme` object, following [Material UI themes documentation](https://material-ui.com/customization/themes/). Material UI merges custom theme objects with the default theme.

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

The `muiTheme` object contains the following keys:

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

**Tip**: Check [Material UI default theme documentation](https://material-ui.com/customization/default-theme/) to see the default values and meaning for these keys.

Once your theme is defined, pass it to the `<Admin>` component, in the `theme` prop.

```jsx
const App = () => (
    <Admin theme={myTheme} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

## Using a Custom Layout

Instead of the default layout, you can use your own component as the admin layout. Just use the `appLayout` prop of the `<Admin>` component:

```jsx
// in src/App.js
import MyLayout from './MyLayout';

const App = () => (
    <Admin appLayout={MyLayout} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

Your custom layout can extend the default `<Layout>` component if you only want to override the appBar, the menu, or the notification component. For instance:

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

For more custom layouts, write a component from scratch. It must contain a `{children}` placeholder, where react-admin will render the resources. Use the [default layout](https://github.com/marmelab/react-admin/blob/master/src/mui/layout/Layout.js) as a starting point. Here is a simplified version (with no responsive support):

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

## Using a Custom Menu

By default, React-admin uses the list of `<Resource>` components passed as children of `<Admin>` to build a menu to each resource with a `list` component.

If you want to add or remove menu items, for instance to link to non-resources pages, you can create your own menu component:

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

**Tip**: Note the `MenuItemLink` component. It must be used to avoid unwanted side effects in mobile views.

**Tip**: Note that we include the `logout` item only on small devices. Indeed, the `logout` button is already displayed in the AppBar on larger devices.

**Tip**: Note that we use React Router [`withRouter`](https://reacttraining.com/react-router/web/api/withRouter) Higher Order Component and that it is used **before** Redux [`connect](https://github.com/reactjs/react-redux/blob/master/docs/api.html#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options). This is required if you want the active menu item to be highlighted.

To use this custom menu component, pass it to a custom Layout, as explained above:

```jsx
// in src/MyLayout.js
import { Layout } from 'react-admin';
import MyMenu from './MyMenu';

const MyLayout = (props) => <Layout {...props} menu={MyMenu} />;

export default MyLayout;
```

Then, use this layout in the `<Admin>` `applayout` prop:

```jsx
// in src/App.js
import MyLayout from './MyLayout';

const App = () => (
    <Admin appLayout={MyLayout} dataProvider={simpleRestProvider('http://path.to.my.api')}>
        // ...
    </Admin>
);
```

**Tip**: If you use authentication, don't forget to render the `logout` prop in your custom menu component. Also, the `onMenuClick` function passed as prop is used to close the sidebar on mobile.

The `MenuItemLink` component make use of the React Router [`NavLink`](https://reacttraining.com/react-router/web/api/NavLink) component, hence allowing to customize its style when it targets the current page.

If the default active style does not suit your tastes, you can override it by passing your own `classes`:

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

If you use your own layout (or custom login page), then you probably use the `<Notification>` component.

You can override the notification duration by setting the `autoHideDuration` prop. It defaults to 4000, i.e. 4 seconds. For instance, to create a custom Notification component with a 5 seconds default:

```jsx
// in src/MyNotification.js
import { Notification } from 'react-admin';

const MyNotification = props => <Notification {...props}autoHideDuration={5000} />;

export default MyNotification;
```

**Tip**: if you use the `showNotification` action, then you can define `autoHideDuration` per message as the third parameter of the `showNotification` action creator.

## Loading

Display a circular progress component with optional messages. Display the same loading component as `react-admin` on custom pages for consistency.

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