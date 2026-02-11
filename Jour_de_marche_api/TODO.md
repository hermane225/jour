# TODO: Correct Shop Role Logic

## Steps to Complete

- [ ] Update Jour_de_marche_api/src/api/shops/shops.routes.js: Add rolesMiddleware(['customer']) to POST / route to restrict shop creation to 'customer' role only.
- [ ] Update Jour_de_marche_api/src/api/admin/admin.controller.js: Add getAllShops function for admin to view all shops (including all statuses).
- [ ] Update Jour_de_marche_api/src/api/admin/admin.controller.js: Add deleteShop function for admin to delete a shop.
- [ ] Update Jour_de_marche_api/src/api/admin/admin.routes.js: Add GET /shops route for admin to view all shops.
- [ ] Update Jour_de_marche_api/src/api/admin/admin.routes.js: Add DELETE /shops/:shopId route for admin to delete a shop.
- [ ] Test the API endpoints to ensure role restrictions work and admin can manage shops.
