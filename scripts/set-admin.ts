/**
 * Set admin label on an Appwrite user
 *
 * Usage:
 *   pnpm set-admin user@example.com
 *
 * Requires .env with:
 *   NUXT_PUBLIC_APPWRITE_ENDPOINT
 *   NUXT_PUBLIC_APPWRITE_PROJECT
 *   NUXT_APPWRITE_API_KEY
 */

import { Client, Users, Query } from 'node-appwrite'

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: pnpm set-admin <email>')
    process.exit(1)
  }

  const endpoint = process.env.NUXT_PUBLIC_APPWRITE_ENDPOINT
  const project = process.env.NUXT_PUBLIC_APPWRITE_PROJECT
  const apiKey = process.env.NUXT_APPWRITE_API_KEY || process.env.APPWRITE_API_KEY

  if (!endpoint || !project || !apiKey) {
    console.error('Missing environment variables. Required:')
    console.error('  NUXT_PUBLIC_APPWRITE_ENDPOINT')
    console.error('  NUXT_PUBLIC_APPWRITE_PROJECT')
    console.error('  NUXT_APPWRITE_API_KEY (or APPWRITE_API_KEY)')
    process.exit(1)
  }

  console.log(`\nConnecting to ${endpoint} (project: ${project})...`)

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project)
    .setKey(apiKey)

  const users = new Users(client)

  // Find user by email
  console.log(`\nLooking up user: ${email}...`)
  const result = await users.list([
    Query.equal('email', email)
  ])

  if (result.total === 0) {
    console.error(`\nNo user found with email: ${email}`)
    console.error('Make sure the user has registered first.')
    process.exit(1)
  }

  const user = result.users[0]
  console.log(`Found user: ${user.name || user.email} (ID: ${user.$id})`)
  console.log(`Current labels: [${user.labels.join(', ')}]`)

  // Add admin label (preserve existing labels)
  if (user.labels.includes('admin')) {
    console.log('\nUser already has the "admin" label. Nothing to do.')
    return
  }

  const newLabels = [...user.labels, 'admin']
  await users.updateLabels(user.$id, newLabels)

  console.log(`\n✅ Admin label set! New labels: [${newLabels.join(', ')}]`)
  console.log('Refresh the page in the browser to activate admin access.\n')
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
