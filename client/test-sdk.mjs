import { createClient } from '@insforge/sdk';
const insforge = createClient({
  baseUrl: 'https://zx2bx4r6.eu-central.insforge.app',
  anonKey: 'ik_103b0ea9ee5971ba5ad3fd789e7cfb74',
  isServerMode: true
});
console.log(insforge.auth.getCurrentUser.toString());
