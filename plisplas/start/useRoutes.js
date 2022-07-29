export default function useRoutes(app, routes) {
  for(const route of routes) {
    switch(route.type) {
      case 'GET':
        app.get(route.route, route.controller)
      break;
      case 'POST':
        app.post(route.route, route.controller)
      break;
      case 'PUT':
        app.put(route.route, route.controller)
      break;
      case 'DELETE':
        app.delete(route.route, route.controller)
      break;
      default:
        app.use(route.route, route.controller)
    }
  }
}