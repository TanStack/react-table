/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AnotherRouteImport } from './routes/anotherRoute'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const AnotherRouteRoute = AnotherRouteImport.update({
  id: '/anotherRoute',
  path: '/anotherRoute',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/anotherRoute': {
      id: '/anotherRoute'
      path: '/anotherRoute'
      fullPath: '/anotherRoute'
      preLoaderRoute: typeof AnotherRouteImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/anotherRoute': typeof AnotherRouteRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/anotherRoute': typeof AnotherRouteRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/anotherRoute': typeof AnotherRouteRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/anotherRoute'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/anotherRoute'
  id: '__root__' | '/' | '/anotherRoute'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AnotherRouteRoute: typeof AnotherRouteRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AnotherRouteRoute: AnotherRouteRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/anotherRoute"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/anotherRoute": {
      "filePath": "anotherRoute.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
