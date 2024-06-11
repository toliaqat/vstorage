export function cleanJSON(input) {
  return input
    .replace(/\\\\/g, "") // Removes double backslashes
    .replace(/"#{/g, "{") // Replaces `"#{` with `{`
    .replace(/"\{/g, "{") // Replaces `"{` with `{`
    .replace(/\}"/g, "}") // Replaces `}"` with `}`
    .replace(/"#\[/g, "[") // Replaces `"#[` with `[`
    .replace(/\]"/g, "]") // Replaces `]"` with `]`
    .replace(/\\{/g, "{") // Replaces `\\{` (again for potential duplicates)
    .replace(/\}"/g, "}") // Replaces `}"` (again for potential duplicates)
    .replace(/\\"/g, '"') // Replaces escaped quotes with normal quotes
    .replace(/\}"/g, "}"); // Replaces `}"` (again for potential duplicates)
}
