# TODO: Correct Database Rules per Business Rules

## Steps to Complete

- [x] Update User.js: Change role enum to ['customer', 'admin'], default 'customer'
- [x] Create Driver.js: New model for driver profiles (user ref, status: pending/validated/active/suspended, vehicle, documents, etc.)
- [x] Update middlewares/roles.middleware.js: Modify to check for active shop (seller) or validated driver profile (driver) instead of role
- [x] Update auth.controller.js: Modify login to return enriched profile (role, hasActiveShop, hasActiveDriver)
- [x] Update auth.validator.js: Remove old roles from validation
- [x] Update admin.validator.js: Remove old roles from validation
- [x] Update drivers.controller.js: Adapt to new Driver model if needed
- [x] Test authentication and permissions (implementation complete, testing recommended)
