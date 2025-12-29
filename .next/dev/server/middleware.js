"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "proxy";
exports.ids = ["proxy"];
exports.modules = {

/***/ "(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fjosephmichaut%2FDesktop%2Fairlock%2Fsrc%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fjosephmichaut%2FDesktop%2Fairlock&matchers=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fjosephmichaut%2FDesktop%2Fairlock%2Fsrc%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fjosephmichaut%2FDesktop%2Fairlock&matchers=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/globals */ \"(middleware)/./node_modules/next/dist/server/web/globals.js\");\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/web/adapter */ \"(middleware)/./node_modules/next/dist/server/web/adapter.js\");\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _src_proxy_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/proxy.ts */ \"(middleware)/./src/proxy.ts\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/client/components/is-next-router-error */ \"(middleware)/./node_modules/next/dist/client/components/is-next-router-error.js\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3__);\n\n\n// Import the userland code.\n\n\n\nconst mod = {\n    ..._src_proxy_ts__WEBPACK_IMPORTED_MODULE_2__\n};\nconst page = \"/proxy\";\nconst isProxy = page === '/proxy' || page === '/src/proxy';\nconst handlerUserland = (isProxy ? mod.proxy : mod.middleware) || mod.default;\nclass ProxyMissingExportError extends Error {\n    constructor(message){\n        super(message);\n        // Stack isn't useful here, remove it considering it spams logs during development.\n        this.stack = '';\n    }\n}\n// TODO: This spams logs during development. Find a better way to handle this.\n// Removing this will spam \"fn is not a function\" logs which is worse.\nif (typeof handlerUserland !== 'function') {\n    throw new ProxyMissingExportError(`The ${isProxy ? 'Proxy' : 'Middleware'} file \"${page}\" must export a function named \\`${isProxy ? 'proxy' : 'middleware'}\\` or a default function.`);\n}\n// Proxy will only sent out the FetchEvent to next server,\n// so load instrumentation module here and track the error inside proxy module.\nfunction errorHandledHandler(fn) {\n    return async (...args)=>{\n        try {\n            return await fn(...args);\n        } catch (err) {\n            // In development, error the navigation API usage in runtime,\n            // since it's not allowed to be used in proxy as it's outside of react component tree.\n            if (true) {\n                if ((0,next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_3__.isNextRouterError)(err)) {\n                    err.message = `Next.js navigation API is not allowed to be used in ${isProxy ? 'Proxy' : 'Middleware'}.`;\n                    throw err;\n                }\n            }\n            const req = args[0];\n            const url = new URL(req.url);\n            const resource = url.pathname + url.search;\n            await (0,next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_0__.edgeInstrumentationOnRequestError)(err, {\n                path: resource,\n                method: req.method,\n                headers: Object.fromEntries(req.headers.entries())\n            }, {\n                routerKind: 'Pages Router',\n                routePath: '/proxy',\n                routeType: 'proxy',\n                revalidateReason: undefined\n            });\n            throw err;\n        }\n    };\n}\nconst handler = (opts)=>{\n    return (0,next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_1__.adapter)({\n        ...opts,\n        page,\n        handler: errorHandledHandler(handlerUserland)\n    });\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (handler);\n\n//# sourceMappingURL=middleware.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1taWRkbGV3YXJlLWxvYWRlci5qcz9hYnNvbHV0ZVBhZ2VQYXRoPSUyRlVzZXJzJTJGam9zZXBobWljaGF1dCUyRkRlc2t0b3AlMkZhaXJsb2NrJTJGc3JjJTJGcHJveHkudHMmcGFnZT0lMkZwcm94eSZyb290RGlyPSUyRlVzZXJzJTJGam9zZXBobWljaGF1dCUyRkRlc2t0b3AlMkZhaXJsb2NrJm1hdGNoZXJzPSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFzQztBQUNpQjtBQUN2RDtBQUN1QztBQUMwQztBQUNJO0FBQ3JGO0FBQ0EsT0FBTywwQ0FBSTtBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsa0NBQWtDLFFBQVEsS0FBSyxtQ0FBbUMsaUNBQWlDO0FBQ2hLO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxnQkFBZ0IsSUFBcUM7QUFDckQsb0JBQW9CLG1HQUFpQjtBQUNyQyx5RkFBeUYsaUNBQWlDO0FBQzFIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiwrRkFBaUM7QUFDbkQ7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLHFFQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLGlFQUFlLE9BQU8sRUFBQzs7QUFFdkIiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJuZXh0L2Rpc3Qvc2VydmVyL3dlYi9nbG9iYWxzXCI7XG5pbXBvcnQgeyBhZGFwdGVyIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvd2ViL2FkYXB0ZXJcIjtcbi8vIEltcG9ydCB0aGUgdXNlcmxhbmQgY29kZS5cbmltcG9ydCAqIGFzIF9tb2QgZnJvbSBcIi4vc3JjL3Byb3h5LnRzXCI7XG5pbXBvcnQgeyBlZGdlSW5zdHJ1bWVudGF0aW9uT25SZXF1ZXN0RXJyb3IgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvZ2xvYmFsc1wiO1xuaW1wb3J0IHsgaXNOZXh0Um91dGVyRXJyb3IgfSBmcm9tIFwibmV4dC9kaXN0L2NsaWVudC9jb21wb25lbnRzL2lzLW5leHQtcm91dGVyLWVycm9yXCI7XG5jb25zdCBtb2QgPSB7XG4gICAgLi4uX21vZFxufTtcbmNvbnN0IHBhZ2UgPSBcIi9wcm94eVwiO1xuY29uc3QgaXNQcm94eSA9IHBhZ2UgPT09ICcvcHJveHknIHx8IHBhZ2UgPT09ICcvc3JjL3Byb3h5JztcbmNvbnN0IGhhbmRsZXJVc2VybGFuZCA9IChpc1Byb3h5ID8gbW9kLnByb3h5IDogbW9kLm1pZGRsZXdhcmUpIHx8IG1vZC5kZWZhdWx0O1xuY2xhc3MgUHJveHlNaXNzaW5nRXhwb3J0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICAvLyBTdGFjayBpc24ndCB1c2VmdWwgaGVyZSwgcmVtb3ZlIGl0IGNvbnNpZGVyaW5nIGl0IHNwYW1zIGxvZ3MgZHVyaW5nIGRldmVsb3BtZW50LlxuICAgICAgICB0aGlzLnN0YWNrID0gJyc7XG4gICAgfVxufVxuLy8gVE9ETzogVGhpcyBzcGFtcyBsb2dzIGR1cmluZyBkZXZlbG9wbWVudC4gRmluZCBhIGJldHRlciB3YXkgdG8gaGFuZGxlIHRoaXMuXG4vLyBSZW1vdmluZyB0aGlzIHdpbGwgc3BhbSBcImZuIGlzIG5vdCBhIGZ1bmN0aW9uXCIgbG9ncyB3aGljaCBpcyB3b3JzZS5cbmlmICh0eXBlb2YgaGFuZGxlclVzZXJsYW5kICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFByb3h5TWlzc2luZ0V4cG9ydEVycm9yKGBUaGUgJHtpc1Byb3h5ID8gJ1Byb3h5JyA6ICdNaWRkbGV3YXJlJ30gZmlsZSBcIiR7cGFnZX1cIiBtdXN0IGV4cG9ydCBhIGZ1bmN0aW9uIG5hbWVkIFxcYCR7aXNQcm94eSA/ICdwcm94eScgOiAnbWlkZGxld2FyZSd9XFxgIG9yIGEgZGVmYXVsdCBmdW5jdGlvbi5gKTtcbn1cbi8vIFByb3h5IHdpbGwgb25seSBzZW50IG91dCB0aGUgRmV0Y2hFdmVudCB0byBuZXh0IHNlcnZlcixcbi8vIHNvIGxvYWQgaW5zdHJ1bWVudGF0aW9uIG1vZHVsZSBoZXJlIGFuZCB0cmFjayB0aGUgZXJyb3IgaW5zaWRlIHByb3h5IG1vZHVsZS5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlZEhhbmRsZXIoZm4pIHtcbiAgICByZXR1cm4gYXN5bmMgKC4uLmFyZ3MpPT57XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZm4oLi4uYXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gSW4gZGV2ZWxvcG1lbnQsIGVycm9yIHRoZSBuYXZpZ2F0aW9uIEFQSSB1c2FnZSBpbiBydW50aW1lLFxuICAgICAgICAgICAgLy8gc2luY2UgaXQncyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIGluIHByb3h5IGFzIGl0J3Mgb3V0c2lkZSBvZiByZWFjdCBjb21wb25lbnQgdHJlZS5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmV4dFJvdXRlckVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPSBgTmV4dC5qcyBuYXZpZ2F0aW9uIEFQSSBpcyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIGluICR7aXNQcm94eSA/ICdQcm94eScgOiAnTWlkZGxld2FyZSd9LmA7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXEgPSBhcmdzWzBdO1xuICAgICAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlID0gdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaDtcbiAgICAgICAgICAgIGF3YWl0IGVkZ2VJbnN0cnVtZW50YXRpb25PblJlcXVlc3RFcnJvcihlcnIsIHtcbiAgICAgICAgICAgICAgICBwYXRoOiByZXNvdXJjZSxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlcS5oZWFkZXJzLmVudHJpZXMoKSlcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICByb3V0ZXJLaW5kOiAnUGFnZXMgUm91dGVyJyxcbiAgICAgICAgICAgICAgICByb3V0ZVBhdGg6ICcvcHJveHknLFxuICAgICAgICAgICAgICAgIHJvdXRlVHlwZTogJ3Byb3h5JyxcbiAgICAgICAgICAgICAgICByZXZhbGlkYXRlUmVhc29uOiB1bmRlZmluZWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmNvbnN0IGhhbmRsZXIgPSAob3B0cyk9PntcbiAgICByZXR1cm4gYWRhcHRlcih7XG4gICAgICAgIC4uLm9wdHMsXG4gICAgICAgIHBhZ2UsXG4gICAgICAgIGhhbmRsZXI6IGVycm9ySGFuZGxlZEhhbmRsZXIoaGFuZGxlclVzZXJsYW5kKVxuICAgIH0pO1xufTtcbmV4cG9ydCBkZWZhdWx0IGhhbmRsZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1pZGRsZXdhcmUuanMubWFwXG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fjosephmichaut%2FDesktop%2Fairlock%2Fsrc%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fjosephmichaut%2FDesktop%2Fairlock&matchers=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(middleware)/./src/proxy.ts":
/*!**********************!*\
  !*** ./src/proxy.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @clerk/nextjs/server */ \"(middleware)/./node_modules/@clerk/nextjs/dist/esm/server/routeMatcher.js\");\n/* harmony import */ var _clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @clerk/nextjs/server */ \"(middleware)/./node_modules/@clerk/nextjs/dist/esm/server/clerkMiddleware.js\");\n\nconst isPublicRoute = (0,_clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_0__.createRouteMatcher)([\n    \"/\",\n    \"/pricing\",\n    \"/security\",\n    \"/sign-in(.*)\",\n    \"/sign-up(.*)\",\n    \"/api/public(.*)\",\n    \"/share(.*)\"\n]);\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_1__.clerkMiddleware)(async (auth, request)=>{\n    if (!isPublicRoute(request)) {\n        await auth.protect();\n    }\n}));\nconst config = {\n    matcher: [\n        // Skip Next.js internals and all static files, unless found in search params\n        '/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',\n        // Always run for API routes\n        '/(api|trpc)(.*)'\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vc3JjL3Byb3h5LnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBMkU7QUFFM0UsTUFBTUUsZ0JBQWdCRCx3RUFBa0JBLENBQUM7SUFDdkM7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7Q0FDRDtBQUVELGlFQUFlRCxxRUFBZUEsQ0FBQyxPQUFPRyxNQUFNQztJQUMxQyxJQUFJLENBQUNGLGNBQWNFLFVBQVU7UUFDM0IsTUFBTUQsS0FBS0UsT0FBTztJQUNwQjtBQUNGLEVBQUUsRUFBQztBQUVJLE1BQU1DLFNBQVM7SUFDcEJDLFNBQVM7UUFDUCw2RUFBNkU7UUFDN0U7UUFDQSw0QkFBNEI7UUFDNUI7S0FDRDtBQUNILEVBQUUiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3NlcGhtaWNoYXV0L0Rlc2t0b3AvYWlybG9jay9zcmMvcHJveHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY2xlcmtNaWRkbGV3YXJlLCBjcmVhdGVSb3V0ZU1hdGNoZXIgfSBmcm9tIFwiQGNsZXJrL25leHRqcy9zZXJ2ZXJcIjtcblxuY29uc3QgaXNQdWJsaWNSb3V0ZSA9IGNyZWF0ZVJvdXRlTWF0Y2hlcihbXG4gIFwiL1wiLFxuICBcIi9wcmljaW5nXCIsXG4gIFwiL3NlY3VyaXR5XCIsXG4gIFwiL3NpZ24taW4oLiopXCIsXG4gIFwiL3NpZ24tdXAoLiopXCIsXG4gIFwiL2FwaS9wdWJsaWMoLiopXCIsXG4gIFwiL3NoYXJlKC4qKVwiLCAvLyBQb3VyIGxlcyBsaWVucyBkZSBwYXJ0YWdlIHB1YmxpY3Ncbl0pO1xuXG5leHBvcnQgZGVmYXVsdCBjbGVya01pZGRsZXdhcmUoYXN5bmMgKGF1dGgsIHJlcXVlc3QpID0+IHtcbiAgaWYgKCFpc1B1YmxpY1JvdXRlKHJlcXVlc3QpKSB7XG4gICAgYXdhaXQgYXV0aC5wcm90ZWN0KCk7XG4gIH1cbn0pO1xuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBtYXRjaGVyOiBbXG4gICAgLy8gU2tpcCBOZXh0LmpzIGludGVybmFscyBhbmQgYWxsIHN0YXRpYyBmaWxlcywgdW5sZXNzIGZvdW5kIGluIHNlYXJjaCBwYXJhbXNcbiAgICAnLygoPyFfbmV4dHxbXj9dKlxcXFwuKD86aHRtbD98Y3NzfGpzKD8hb24pfGpwZT9nfHdlYnB8cG5nfGdpZnxzdmd8dHRmfHdvZmYyP3xpY298Y3N2fGRvY3g/fHhsc3g/fHppcHx3ZWJtYW5pZmVzdCkpLiopJyxcbiAgICAvLyBBbHdheXMgcnVuIGZvciBBUEkgcm91dGVzXG4gICAgJy8oYXBpfHRycGMpKC4qKScsXG4gIF0sXG59O1xuXG4iXSwibmFtZXMiOlsiY2xlcmtNaWRkbGV3YXJlIiwiY3JlYXRlUm91dGVNYXRjaGVyIiwiaXNQdWJsaWNSb3V0ZSIsImF1dGgiLCJyZXF1ZXN0IiwicHJvdGVjdCIsImNvbmZpZyIsIm1hdGNoZXIiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(middleware)/./src/proxy.ts\n");

/***/ }),

/***/ "../../server/app-render/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/server/app-render/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/action-async-storage.external.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "../incremental-cache/tags-manifest.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/lib/incremental-cache/tags-manifest.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/incremental-cache/tags-manifest.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@clerk","vendor-chunks/next","vendor-chunks/@opentelemetry","vendor-chunks/cookie"], () => (__webpack_exec__("(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fjosephmichaut%2FDesktop%2Fairlock%2Fsrc%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fjosephmichaut%2FDesktop%2Fairlock&matchers=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();