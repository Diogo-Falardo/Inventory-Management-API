# The Manager — Business Management API Multi‑Tool

The Manager is a modular API designed to manage any type of business: Store, manufacturer, organization, workspace, or any structure that requires a unified management layer.

The primary goal is to provide a clean, scalable backend foundation for user management, inventory, operations, and internal tooling.

---

## Technical Design

The API is structured for clarity and scalability, minimizing unnecessary endpoints and complexity.

- Built on the Bun runtime for high performance and low latency.
- Utilizes Hono, a lightweight and fast web application framework.
- Employs PostgreSQL as the database, with connections managed via Drizzle ORM (migration-first approach).
- Implements LogLayer for consistent logging throughout the application.

---

## Core Concepts

Each business can include:

- Users
- Roles
- Inventory (not yet)
- Operations (not yet)
- Custom modules (not yet)


### API‑First Approach

The Manager exposes a consistent API for:

- Authentication & user management
- Role & permission control
- Inventory management (not yet)
- Business operations (not yet)
- Custom extensions (not yet)

---

## Current Version
**v1.0**

***Project is being updated so not every functionality is already updated***

### Key Features

***Some Features here are outdated and need to be updated***

- Users can create and update business.
- Users can invite others to join a business.
- Users and staff members can add or remove members from the staff list.
- Staff members can create, delete, and update roles and their permissions.


### Users

- Users can be created and deleted.
- Users can log in.

### User and Business Interaction

- Users can create business and automatically become the owner.
- Only the current owner can transfer ownership of a business.
- business can be deleted by their owner.
- The only way to join a business is via an invite link, which assigns the "Viewer" role (no permissions).

### Business Staff Actions

A staff member with the appropriate role and permissions can:

- View the list of other staff members in the same business.
- Add new members to the staff list.
- Create new roles.
- Add or remove permissions from a role.
- Update the business.

### Permissions

Permissions define actions that users can perform:

1. Update business information
2. Add business staff members
3. Remove business staff members
4. Create new business roles
5. Delete business roles
6. Update business role permissions
7. Add Pre Defined Roles

### Invite Links

- When a user joins via an invite link, they are automatically added as a staff member with the "Viewer" role.
- The "Viewer" role has no permissions:
  - Cannot perform any actions within the business.
  - Cannot be deleted.

### List of Pre-defined roles

Staff - Manager : {

1. Create New business Roles
2. Add Pre Defined Roles
3. Update business role permission
4. Delete business roles
5. Add business staff member
6. Remove business staff member
   }
---

### Staff Management Overview

The concept of staff Management replaces traditional "User management" to  better reflect the business context and the roles users play withing each business entity

#### Why "Staff Management"

Every user in the system is is created with the intention of either:

- Creating a new business (becoming an owner), or
- Joining an existing business (becoming part of it as staff or viewer).

As a result, all users are inherently staff members of at least one business. This approach emphasizes that users are not just generic accounts, but active participants in one or more business entities, each with specific roles and permissions.

#### How Staff Management Works

**Staff Members:**  
Any user who is part of a business is considered a staff member. This includes owners, managers, and viewers.

**Roles and Permissions:**  
Each staff member is assigned a role (such as Owner, Staff Manager, Product Manager, or Viewer). Roles define what actions a staff member can perform within the business.

**Role Configuration:**  
Roles and their permissions can be configured only by the business owner or by staff members who have been granted the necessary permissions by the owner (e.g., a Staff Manager).

**Default Roles:**  
The system provides default roles like "Owner" (full control), "Viewer" (no permissions), and "Staff Manager" (can manage roles and permissions). Additional custom roles can be created as needed.

----

## How to run the project

```
bun install
bun run dev
bun drizzle-kit studio (check db)
```
