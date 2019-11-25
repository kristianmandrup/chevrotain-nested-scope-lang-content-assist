const onCompletionResolve = (item: CompletionItem): CompletionItem => {
  item.detail = item.data;
  item.documentation = `${item.data} reference`;
  return item;
};
