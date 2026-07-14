function safeIngest(ctx, source = "telegram") {
  const raw =
    ctx?.message?.text ||
    ctx?.body ||
    ctx?.text ||
    "";

  return {
    userId: String(ctx.from?.id || ctx.userId || "unknown"),
    text: typeof raw === "string" ? raw : String(raw),
    source
  };
}

module.exports = { safeIngest };
