const ReduceTextLength = (text: string, length: number) => {
  if (length <= 0) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export default ReduceTextLength;