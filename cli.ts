import { request, gql, GraphQLClient } from "https://raw.githubusercontent.com/justinmchase/graphql-request/patch-1/mod.ts";

if (import.meta.main) {
  main();
}

async function main() {
  const timestamp = Date.now()
  const address = await getAddress()
  const dir = address + "/" + timestamp.toString();
  await exportMarkdown(dir, address)
}

function getAddress(): string {
  if (Deno.args[0] === undefined) {
    console.log("You have to pass an Address");
    Deno.exit();
  }

  return Deno.args[0];
}

async function exportMarkdown(dir: string, address: string) {
  const client = new GraphQLClient('https://mirror-api.com/graphql')
  const query = gql`
    query($address: String!) {
      entries(projectAddress: $address) {
        digest
        title
        timestamp
        publishStatus
        body
      }
    }
  `
  const variables = {
    address: address,
  }

  await Deno.mkdir(dir, { recursive: true });
  const data = await client.request(query, variables)
  for (const i of data.entries) {
    const content = "---\ntitle: " + i.title + "\ndate: " + getDate(i.timestamp) +"\nstatus: "+ i.publishStatus + "\n---\n" + i.body
    Deno.writeTextFile(dir + "/" + i.digest + ".md", content)
  }
}

function getDate(timestamp: number) {
  const date = new Date(timestamp);
  return date.toISOString()
}