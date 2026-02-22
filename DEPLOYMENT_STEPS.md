# Backend schema update required

The Product model now includes additional fields: `topLength`, `pantLength`, `fabric`, `washCare`, `stockBySize`, `availableSizes`.

**On your Railway backend**, run:

```bash
cd backend
npx prisma db push
```

Or if you use migrations:

```bash
npx prisma migrate dev --name add_product_details
# Then deploy and run: npx prisma migrate deploy
```
