---
id: data-providers
title: Data Providers
---
无论使用何种规范，REST，GraphQL还是SOAP。React-admin都可以与它的API进行通信。 对于 REST 服务器, 它可以是 [JSON API](http://jsonapi.org/), [HAL](http://stateless.co/hal_specification.html), [OData](http://www.odata.org/) 或自定义规范。 React-admin 只需要一个 Data Provider 函数。 这是将数据查询转换为 http 请求的地方, 以及对数据响应的 http 响应。

![Data Provider architecture](https://marmelab.com/react-admin/img/data-provider.png)

`<Admin>` 组件的 `dataProvider` 参数必须是具有以下签名的函数：

```jsx
/**
 * Query a data provider and return a promise for a response
 *
 * @example
 * dataProvider(GET_ONE, 'posts', { id: 123 })
 *  => Promise.resolve({ data: { id: 123, title: "hello, world" } })
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the action type
 * @returns {Promise} the Promise for a response
 */
const dataProvider = (type, resource, params) => new Promise();
```

您可以在 [`packages/ra-data-simple-rest/src/index.js`](https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/src/index.js) 找到 Data Provider 示例实现。

`dataProvider` 也是添加自定义 HTTP 头、身份验证等的理想位置。

## 可用的 Provider

React-admin 项目包括 4 个 Data Provider:

* Simple REST：[marmelab/ra-data-simple-rest](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-simple-rest) （[请阅读以下内容](#simple-rest)）。 它主要用作一个例子。 顺便提一下, 它与 [FakeRest](https://github.com/marmelab/FakeRest) API 兼容。
* **[JSON server](https://github.com/typicode/json-server)**: [marmelab/ra-data-json-server](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-json-server). 非常适合在尚未开发的 REST API 上，做一个 admin 原型。
* [Graphcool](https://www.graph.cool/): [marmelab/ra-data-graphcool](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-graphcool). 遵循 Graphcool 约定的 GraphQL 服务器 Provider。 顺便提一下, 这个包建立在 [marmelab/ra-data-graphql](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-graphql)上, 它允许您为其他 graphql 约定开发Provider。
* Local JSON: [marmelab/ra-data-fakerest](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-fakerest). 基于本地对象, 它甚至不使用 HTTP。 用于测试目的。

您可以在第三方存储库中找到各种后端的 Data Provider：

* **[DynamoDb](https://github.com/abiglobalhealth/aor-dynamodb-client)**: [abiglobalhealth/aor-dynamodb-client](https://github.com/abiglobalhealth/aor-dynamodb-client)
* **[Epilogue](https://github.com/dchester/epilogue)**: [dunghuynh/aor-epilogue-client](https://github.com/dunghuynh/aor-epilogue-client)
* **[Feathersjs](http://www.feathersjs.com/)**: [josx/aor-feathers-client](https://github.com/josx/aor-feathers-client)
* **[Firebase](https://firebase.google.com/)**: [sidferreira/aor-firebase-client](https://github.com/sidferreira/aor-firebase-client)
* **[JSON API](http://jsonapi.org/)**: [moonlight-labs/aor-jsonapi-client](https://github.com/moonlight-labs/aor-jsonapi-client)
* **[Loopback](http://loopback.io/)**: [kimkha/aor-loopback](https://github.com/kimkha/aor-loopback)
* **[Parse Server](https://github.com/ParsePlatform/parse-server)**: [leperone/aor-parseserver-client](https://github.com/leperone/aor-parseserver-client)
* **[PostgREST](http://postgrest.com/en/v0.4/)**: [tomberek/aor-postgrest-client](https://github.com/tomberek/aor-postgrest-client)
* **[Xmysql](https://github.com/o1lab/xmysql)**: [soaserele/aor-xmysql](https://github.com/soaserele/aor-xmysql)

如果您已经为另一个后端编写了一个 Data Provider，并开放了它的源代码，请使用您的包帮助完成这个列表。

## 用法

作为一个示例，让我们关注 Simple REST data provider 。它使用过滤器和排序的简单GET参数来满足REST api。

安装 `ra-data-simple-rest` 包以使用此 provider。

```sh
npm install ra-data-simple-rest
```

然后, 使用 REST 后端 URL 初始化 Provider, 并将结果传递给 `<Admin>` 组件的 `dataProvider` 属性:

```jsx
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

import { PostList } from './posts';

const App = () => (
    <Admin dataProvider={simpleRestProvider('http://path.to.my.api/')}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

以下是此 Provider 如何将请求类型映射到 API 调用：

| Request type         | API calls                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `GET_LIST`           | `GET http://my.api.url/posts?sort=['title','ASC']&range=[0, 24]&filter={title:'bar'}` |
| `GET_ONE`            | `GET http://my.api.url/posts/123`                                                             |
| `CREATE`             | `POST http://my.api.url/posts/123`                                                            |
| `UPDATE`             | `PUT http://my.api.url/posts/123`                                                             |
| `UPDATE_MANY`        | Multiple calls to `PUT http://my.api.url/posts/123`                                           |
| `DELETE`             | `DELETE http://my.api.url/posts/123`                                                          |
| `DELETE_MANY`        | Multiple calls to `DELETE http://my.api.url/posts/123`                                        |
| `GET_MANY`           | `GET http://my.api.url/posts?filter={ids:[123,456,789]}`                                      |
| `GET_MANY_REFERENCE` | `GET http://my.api.url/posts?filter={author_id:345}`                                          |

**注意**：Simple REST Client 希望 API 在对 GET_LIST 调用的响应中包含 Content-Range 头。 该值必须是集合中的资源总数。 这使 react-admin 能够知道总共有多少页资源，并生成分页控件。

    Content-Range: posts 0-24/319
    

在 JS 代码中如果您的 API 是在另一个域中，你需要到白名单中为这个添加一个 `Access-Control-Expose-Headers` [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) 头。

    Access-Control-Expose-Headers: Content-Range
    

## 添加自定义头

`simpleRestProvider` 函数接受一个 HTTP client 函数作为第二个参数。 默认情况下, 他们使用 react-admin 的 `fetchUtils.fetchJson()` 作为 HTTP client。 它类似于HTML5 `fetch()`，除了它自动处理 JSON 解码和 HTTP 错误代码。

这意味着如果您需要为请求添加自定义头，您可以将 `etchJson()` 调用*包装*在您自己的函数中：

```jsx
import { fetchUtils, Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    // add your own headers here
    options.headers.set('X-Custom-Header', 'foobar');
    return fetchUtils.fetchJson(url, options);
}
const dataProvider = simpleRestProvider('http://path.to.my.api/', httpClient);

const App = () => (
    <Admin dataProvider={dataProvider}>
        <Resource name="posts" list={PostList} />
    </Admin>
);
```

现在，对 REST API 的所有请求都将包含 `X-Custom-Header:foobar` 头。

**提示**：自定义头的最常见用法是进行身份验证。 `fetchJson` 具有对 Authorization 令牌头的内置支持：

```jsx
const httpClient = (url, options = {}) => {
    options.user = {
        authenticated: true,
        token: 'SRTRDFVESGNJYTUKTYTHRG'
    }
    return fetchUtils.fetchJson(url, options);
}
const dataProvider = simpleRestProvider('http://path.to.my.api/', httpClient);
```

现在，对REST API的所有请求都将包含 `Authorization：SRTRDFVESGNJYTUKTYTHRG` 头。

## 装饰 Data Provider（文件上载示例）

您可以增强现有 Data Provider 的功能，而不是编写自己的 Data Provider。您甚至可以自定义限制给定资源。

例如，如果您想要使用上传组件（如 `<ImageInput />`组件），你可以按以下方式修饰它：

```jsx
// in addUploadFeature.js
/**
 * Convert a `File` object returned by the upload input into a base 64 string.
 * That's not the most optimized way to store images in production, but it's
 * enough to illustrate the idea of data provider decoration.
 */
const convertFileToBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.rawFile);

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

/**
 * For posts update only, convert uploaded image in base 64 and attach it to
 * the `picture` sent property, with `src` and `title` attributes.
 */
const addUploadFeature = requestHandler => (type, resource, params) => {
    if (type === 'UPDATE' && resource === 'posts') {
        if (params.data.pictures && params.data.pictures.length) {
            // only freshly dropped pictures are instance of File
            const formerPictures = params.data.pictures.filter(p.rawFile => !(p instanceof File));
            const newPictures = params.data.pictures.filter(p.rawFile => p instanceof File);

            return Promise.all(newPictures.map(convertFileToBase64))
                .then(base64Pictures => base64Pictures.map(picture64 => ({
                    src: picture64,
                    title: `${params.data.title}`,
                })))
                .then(transformedNewPictures => requestHandler(type, resource, {
                    ...params,
                    data: {
                        ...params.data,
                        pictures: [...transformedNewPictures, ...formerPictures],
                    },
                }));
        }
    }
    // for other request types and reources, fall back to the defautl request handler
    return requestHandler(type, resource, params);
};

export default addUploadFeature;
```

To enhance a provider with the upload feature, compose `addUploadFeature` function with the data provider function:

```jsx
import simpleRestProvider from 'ra-data-simple-rest';
import addUploadFeature from './addUploadFeature';

const dataProvider = simpleRestProvider('http://path.to.my.api/');
const uploadCapableDataProvider = addUploadFeature(dataProvider);

const App = () => (
    <Admin dataProvider={uploadCapableDataProvider}>
        <Resource name="posts" list={PostList} />
    </Admin>
);
```

## Writing Your Own Data Provider

Quite often, there is no Data Provider that suits you API - either in the core providers, or in the third-party providers. In such cases, you'll have to write your own Data Provider.

A Data Provider is a function that receives a request, and returns a promise for a response. Both the request and the response format are standardized.

```jsx
/**
 * Query a data provider and return a promise for a response
 *
 * @example
 * dataProvider(GET_ONE, 'posts', { id: 123 })
 *  => Promise.resolve({ data: { id: 123, title: "hello, world" } })
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the action type
 * @returns {Promise} the Promise for a response
 */
const dataProvider = (type, resource, params) => new Promise();
```

When you write a Data provider, your job is to route requests to your API backend(s), then transform their response to match the format returned by the Data Provider.

### Request Format

Data queries require a *type* (e.g. `GET_ONE`), a *resource* (e.g. 'posts') and a set of *parameters*.

*Tip*: In comparison, HTTP requests require a *verb* (e.g. 'GET'), an *url* (e.g. 'http://myapi.com/posts'), a list of *headers* (like `Content-Type`) and a *body*.

Possible types are:

| Type                 | Usage                                           | Params format                                                                                                                                   |
| -------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET_LIST`           | Search for resources                            | `{ pagination: { page: {int} , perPage: {int} }, sort: { field: {string}, order: {string} }, filter: {Object} }`                                |
| `GET_ONE`            | Read a single resource, by id                   | `{ id: {mixed} }`                                                                                                                               |
| `CREATE`             | Create a single resource                        | `{ data: {Object} }`                                                                                                                            |
| `UPDATE`             | Update a single resource                        | `{ id: {mixed}, data: {Object}, previousData: {Object} }`                                                                                       |
| `UPDATE_MANY`        | Update multiple resources                       | `{ ids: {mixed[]}, data: {Object} }`                                                                                                            |
| `DELETE`             | Delete a single resource                        | `{ id: {mixed}, previousData: {Object} }`                                                                                                       |
| `DELETE_MANY`        | Delete multiple resources                       | `{ ids: {mixed[]} }`                                                                                                                            |
| `GET_MANY`           | Read a list of resource, by ids                 | `{ ids: {mixed[]} }`                                                                                                                            |
| `GET_MANY_REFERENCE` | Read a list of resources related to another one | `{ target: {string}, id: {mixed}, pagination: { page: {int} , perPage: {int} }, sort: { field: {string}, order: {string} }, filter: {Object} }` |

Here are several examples of how react-admin can call the Data Provider with these types:

```jsx
dataProvider(GET_LIST, 'posts', {
    pagination: { page: 1, perPage: 5 },
    sort: { field: 'title', order: 'ASC' },
    filter: { author_id: 12 },
});
dataProvider(GET_ONE, 'posts', { id: 123 });
dataProvider(CREATE, 'posts', { data: { title: "hello, world" } });
dataProvider(UPDATE, 'posts', {
    id: 123,
    data: { title: "hello, world!" },
    previousData: { title: "previous title" }
});
dataProvider(UPDATE_MANY, 'posts', {
    ids: [123, 234],
    data: { views: 0 },
});
dataProvider(DELETE, 'posts', {
    id: 123,
    previousData: { title: "hello, world" }
});
dataProvider(DELETE_MANY, 'posts', { ids: [123, 234] });
dataProvider(GET_MANY, 'posts', { ids: [123, 124, 125] });
dataProvider(GET_MANY_REFERENCE, 'comments', {
    target: 'post_id',
    id: 123,
    sort: { field: 'created_at', order: 'DESC' }
});
```

### Example Request Processing

Let's say that you want to map the Data Provider requests to a REST backend, like so:

* `GET_LIST => GET http://path.to.my.api/posts?sort=["title","ASC"]&range=[0, 24]&filter={"author_id":12}`
* `GET_ONE => GET http://path.to.my.api/posts/123`
* `CREATE => POST http://path.to.my.api/posts`
* `UPDATE => PUT http://path.to.my.api/posts/123`
* `UPDATE_MANY => PUT http://path.to.my.api/posts?filter={"ids":[123,124,125]}`
* `DELETE => DELETE http://path.to.my.api/posts/123`
* `DELETE_MANY => DELETE http://path.to.my.api/posts?filter={"ids":[123,124,125]}`
* `GET_MANY => GET http://path.to.my.api/posts?filter={"ids":[123,124,125]}`
* `GET_MANY_REFERENCE  => GET http://path.to.my.api/comments?sort=["created_at","DESC"]&range=[0, 24]&filter={"post_id":123}`

Data Providers often use a `switch` statement, and finish by a call to `fetch()`. Here is an example implementation:

```js
// in myRestProvider.js
import { stringify } from 'query-string';
import {
    GET_LIST,
    GET_ONE,
    CREATE,
    UPDATE,
    DELETE,
    GET_MANY,
    GET_MANY_REFERENCE,
} from 'react-admin';

const apiUrl = 'http://path.to.my.api/';

/**
 * Maps react-admin queries to my REST API
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the request type
 * @returns {Promise} the Promise for a data response
 */
export default (type, resource, params) => {
    let url = '';
    const options = { 
        headers : new Headers({
            Accept: 'application/json',
        }),
    };
    switch (type) {
        case GET_LIST: {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([
                    (page - 1) * perPage,
                    page * perPage - 1,
                ]),
                filter: JSON.stringify(params.filter),
            };
            url = `${apiUrl}/${resource}?${stringify(query)}`;
            break;
        }
        case GET_ONE:
            url = `${apiUrl}/${resource}/${params.id}`;
            break;
        case CREATE:
            url = `${apiUrl}/${resource}`;
            options.method = 'POST';
            options.body = JSON.stringify(params.data);
            break;
        case UPDATE:
            url = `${apiUrl}/${resource}/${params.id}`;
            options.method = 'PUT';
            options.body = JSON.stringify(params.data);
            break;
        case UPDATE_MANY:
            const query = {
                filter: JSON.stringify({ id: params.ids }),
            };
            url = `${apiUrl}/${resource}?${stringify(query)}`;
            options.method = 'PATCH';
            options.body = JSON.stringify(params.data);
            break;
        case DELETE:
            url = `${apiUrl}/${resource}/${params.id}`;
            options.method = 'DELETE';
            break;
        case DELETE_MANY:
            const query = {
                filter: JSON.stringify({ id: params.ids }),
            };
            url = `${apiUrl}/${resource}?${stringify(query)}`;
            options.method = 'DELETE';
            break;
        case GET_MANY: {
            const query = {
                filter: JSON.stringify({ id: params.ids }),
            };
            url = `${apiUrl}/${resource}?${stringify(query)}`;
            break;
        }
        case GET_MANY_REFERENCE: {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([
                    (page - 1) * perPage,
                    page * perPage - 1,
                ]),
                filter: JSON.stringify({
                    ...params.filter,
                    [params.target]: params.id,
                }),
            };
            url = `${apiUrl}/${resource}?${stringify(query)}`;
            break;
        }
        default:
            throw new Error(`Unsupported Data Provider request type ${type}`);
    }

    return fetch(url, options)
        .then(res => res.json())
        .then(response =>
            /* Convert HTTP Response to Data Provider Response */
            /* Covered in the next section */
        );
};
```

### Response Format

React-admin expects responses from Data Providers to be objects with a `data` property. The data format depends on the request type.

| Request Type         | Response format                                       |
| -------------------- | ----------------------------------------------------- |
| `GET_LIST`           | `{ data: {Record[]}, total: {int} }`                  |
| `GET_ONE`            | `{ data: {Record} }`                                  |
| `CREATE`             | `{ data: {Record} }`                                  |
| `UPDATE`             | `{ data: {Record} }`                                  |
| `UPDATE_MANY`        | `{ data: {mixed[]} }` The ids which have been updated |
| `DELETE`             | `{ data: {Record} }`                                  |
| `DELETE_MANY`        | `{ data: {mixed[]} }` The ids which have been deleted |
| `GET_MANY`           | `{ data: {Record[]} }`                                |
| `GET_MANY_REFERENCE` | `{ data: {Record[]}, total: {int} }`                  |

A `{Record}` is an object literal with at least an `id` property, e.g. `{ id: 123, title: "hello, world" }`.

Building up on the previous example, here are example responses matching the format expected by react-admin:

```jsx
dataProvider(GET_LIST, 'posts', {
    pagination: { page: 1, perPage: 5 },
    sort: { field: 'title', order: 'ASC' },
    filter: { author_id: 12 },
})
.then(response => console.log(response));
// {
//     data: [
//         { id: 126, title: "allo?", author_id: 12 },
//         { id: 127, title: "bien le bonjour", author_id: 12 },
//         { id: 124, title: "good day sunshine", author_id: 12 },
//         { id: 123, title: "hello, world", author_id: 12 },
//         { id: 125, title: "howdy partner", author_id: 12 },
//     ],
//     total: 27
// }

dataProvider(GET_ONE, 'posts', { id: 123 })
.then(response => console.log(response));
// {
//     data: { id: 123, title: "hello, world" }
// }

dataProvider(CREATE, 'posts', { data: { title: "hello, world" } })
.then(response => console.log(response));
// {
//     data: { id: 450, title: "hello, world" }
// }

dataProvider(UPDATE, 'posts', {
    id: 123,
    data: { title: "hello, world!" },
    previousData: { title: "previous title" }
})
.then(response => console.log(response));
// {
//     data: { id: 123, title: "hello, world!" }
// }

dataProvider(UPDATE_MANY, 'posts', {
    ids: [123, 234],
    data: { views: 0 },
})
.then(response => console.log(response));
// {
//     data: [123, 234]
// }

dataProvider(DELETE, 'posts', {
    id: 123,
    previousData: { title: "hello, world!" }
})
.then(response => console.log(response));
// {
//     data: { id: 123, title: "hello, world" }
// }

dataProvider(DELETE_MANY, 'posts', { ids: [123, 234] })
.then(response => console.log(response));
// {
//     data: [123, 234]
// }

dataProvider(GET_MANY, 'posts', { ids: [123, 124, 125] })
.then(response => console.log(response));
// {
//     data: [
//         { id: 123, title: "hello, world" },
//         { id: 124, title: "good day sunshise" },
//         { id: 125, title: "howdy partner" },
//     ]
// }

dataProvider(GET_MANY_REFERENCE, 'comments', {
    target: 'post_id',
    id: 123,
    sort: { field: 'created_at', order: 'DESC' }
});
.then(response => console.log(response));
// {
//     data: [
//         { id: 667, title: "I agree", post_id: 123 },
//         { id: 895, title: "I don't agree", post_id: 123 },
//     ],
//     total: 2,
// }
```

### Example Response Processing

Let's continue with the REST backend example. This backend returns responses as follows:

    GET http://path.to.my.api/posts?sort=['title','ASC']&range=[0, 4]&filter={author_id:12}
    Content-Range: posts 0-4/27
    [
        { "id": 126, "title": "allo?", "author_id": 12 },
        { "id": 127, "title": "bien le bonjour", "author_id": 12 },
        { "id": 124, "title": "good day sunshine", "author_id": 12 },
        { "id": 123, "title": "hello, world", "author_id": 12 },
        { "id": 125, "title": "howdy partner", "author_id": 12 }
    ]
    
    GET http://path.to.my.api/posts/123
    { "id": 123, "title": "hello, world", "author_id": 12 }
    
    POST http://path.to.my.api/posts
    { "id": 123, "title": "hello, world", "author_id": 12 }
    
    PUT http://path.to.my.api/posts/123
    { "id": 123, "title": "hello, world", "author_id": 12 }
    
    PATCH http://path.to.my.api/posts?filter={ids:[123,124,125]}
    [123, 124, 125]
    
    DELETE http://path.to.my.api/posts/123
    { "id": 123, "title": "hello, world", "author_id": 12 }
    
    DELETE http://path.to.my.api/posts?filter={ids:[123,124,125]}
    [123, 124, 125]
    
    GET http://path.to.my.api/posts?filter={ids:[123,124,125]}
    [
        { "id": 123, "title": "hello, world", "author_id": 12 },
        { "id": 124, "title": "good day sunshine", "author_id": 12 },
        { "id": 125, "title": "howdy partner", "author_id": 12 }
    ]
    
    GET http://path.to.my.api/comments?sort=['created_at','DESC']&range=[0, 24]&filter={post_id:123}
    Content-Range: comments 0-1/2
    [
        { "id": 667, "title": "I agree", "post_id": 123 },
        { "id": 895, "title": "I don't agree", "post_id": 123 }
    ]
    

The Data Provider must therefore transform the response from the API backend to the expected response format.

```js
// in myRestProvider.js
import { stringify } from 'query-string';
import {
    GET_LIST,
    GET_ONE,
    CREATE,
    UPDATE,
    UPDATE_MANY,
    DELETE,
    DELETE_MANY,
    GET_MANY,
    GET_MANY_REFERENCE,
} from 'react-admin';

const apiUrl = 'http://path.to.my.api/';

/**
 * Maps react-admin queries to my REST API
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the request type
 * @returns {Promise} the Promise for a data response
 */
export default (type, resource, params) => {
    let url = '';
    const options = { 
        headers : new Headers({
            Accept: 'application/json',
        }),
    };
    switch (type) {
        /* Prepare url and options as above */
    }

    let headers;
    return fetch(url, options)
        .then(res => {
            headers = res.headers;
            return res.json();
        })
        .then(json => {
            switch (type) {
                case GET_LIST:
                case GET_MANY_REFERENCE:
                    if (!headers.has('content-range')) {
                        throw new Error(
                            'The Content-Range header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare Content-Range in the Access-Control-Expose-Headers header?'
                        );
                    }
                    return {
                        data: json,
                        total: parseInt(
                            headers
                                .get('content-range')
                                .split('/')
                                .pop(),
                            10
                        ),
                    };
                case CREATE:
                    return { data: { ...params.data, id: json.id } };
                default:
                    return { data: json };
            }
        });
};
```

### Error Format

When the API backend returns an error, the Data Provider should `throw` an `Error` object. This object should contain a `status` property with the HTTP response code (404, 500, etc.). React-admin inspects this error code, and uses it for [authentication](./Authentication.md) (in case of 401 or 403 errors). Besides, react-admin displays the error `message` on screen in a temporary notification.

### Example implementation

Check the code from the [simple REST client](https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/src/index.js): it's a good starting point for a custom Data Provider implementation.