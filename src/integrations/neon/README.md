# Neon Database Integration

This directory contains the Neon PostgreSQL integration for the Password Manager application.

## Overview

Neon is a serverless PostgreSQL database platform that serves as an alternative to Supabase, particularly useful for users in regions where Supabase is unavailable (like India).

## Files

- **client.ts**: Neon database client configuration and operations
- **types.ts**: TypeScript type definitions (shared with Supabase)
- **README.md**: This file

## Quick Start

### 1. Set up Neon Project

Visit [neon.tech](https://neon.tech) and create a new project.

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
VITE_NEON_DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require
VITE_DATABASE_PROVIDER=neon
```

### 3. Run Database Schema Setup

Execute the SQL commands from the [NEON_SETUP_GUIDE.md](../../NEON_SETUP_GUIDE.md) to create your database schema.

### 4. Start Using Neon

Import and use the Neon client:

```typescript
import { neonDatabase } from "@/integrations/neon/client";

// Get all vaults for a user
const vaults = await neonDatabase.vaults.select(userId);

// Create a new vault
const newVault = await neonDatabase.vaults.insert({
  name: "My Vault",
  user_id: userId,
});
```

## API Reference

### NeonClient

Low-level PostgreSQL client for executing raw queries.

```typescript
const result = await neonClient.query(
  'SELECT * FROM vaults WHERE user_id = $1',
  [userId]
);
```

### NeonDatabase

High-level database operations wrapper.

#### Vaults

```typescript
// Select all vaults
await neonDatabase.vaults.select(userId);

// Insert a vault
await neonDatabase.vaults.insert({ name, description, user_id });

// Update a vault
await neonDatabase.vaults.update(id, { name, description });

// Delete a vault
await neonDatabase.vaults.delete(id);
```

#### Passwords

```typescript
// Select passwords
await neonDatabase.passwords.select(userId, vaultId?);

// Insert a password
await neonDatabase.passwords.insert({ name, username, password, url, vault_id, user_id });

// Update a password
await neonDatabase.passwords.update(id, { name, username, password, url });

// Delete a password
await neonDatabase.passwords.delete(id);
```

#### Addresses

```typescript
// Select addresses
await neonDatabase.addresses.select(userId);

// Insert an address
await neonDatabase.addresses.insert({ name, street_address, city, country, user_id });
```

## Switching Between Supabase and Neon

Use the `VITE_DATABASE_PROVIDER` environment variable:

```env
# For Supabase
VITE_DATABASE_PROVIDER=supabase

# For Neon
VITE_DATABASE_PROVIDER=neon
```

Or programmatically:

```typescript
import { databaseAdapter } from '@/lib/database';

databaseAdapter.setProvider('neon');
// or
databaseAdapter.setProvider('supabase');
```

## Authentication

Neon is a database provider only and doesn't include authentication. You need to implement authentication separately using:

- Firebase Authentication
- Clerk
- Custom JWT solution
- Auth0
- NextAuth.js

See [NEON_SETUP_GUIDE.md](../../NEON_SETUP_GUIDE.md) for detailed authentication setup options.

## Performance Optimization

### Connection Pooling

Neon includes built-in connection pooling:

```env
VITE_NEON_DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require&application_name=Password-Manager
```

### Query Optimization

- Use indexes on frequently queried columns (already in schema)
- Use prepared statements (parameterized queries)
- Implement caching for frequently accessed data
- Use pagination for large result sets

### Cold Starts

If using serverless functions:
- Keep connections open for at least 5 minutes
- Use connection pooling to reduce reconnection overhead
- Consider using PgBouncer for connection pooling

## Troubleshooting

### Connection Issues

Check your connection string:
- Format: `postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require`
- Ensure `sslmode=require` is included
- Verify credentials are correct

### Slow Queries

- Add indexes to frequently filtered columns
- Use EXPLAIN ANALYZE to optimize queries
- Consider caching layer for frequently accessed data
- Check Neon dashboard for slow query insights

### Missing Tables

Run the database schema setup commands from NEON_SETUP_GUIDE.md in Neon's SQL Editor.

## Migration from Supabase to Neon

```bash
# Export from Supabase
pg_dump YOUR_SUPABASE_URL > backup.sql

# Import to Neon
psql YOUR_NEON_DATABASE_URL < backup.sql
```

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Discord Community](https://discord.gg/92chJBQJ)
- [Connection String Guide](https://neon.tech/docs/connect/connection-string)

## Support

For issues or questions:
1. Check Neon's documentation
2. Review this integration's code
3. Consult the main [NEON_SETUP_GUIDE.md](../../NEON_SETUP_GUIDE.md)
