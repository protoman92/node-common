describe('Collection Util Tests', () => {
  it('First test', () => {
    const array = [1, 2, 3, 4, 5];
    console.log(array.first({ condition: a => a % 2 === 0 }));
  });

  it('Slice test', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8];
    console.log(array.slicePortion(0, 1 / 3));
    console.log(array.slicePortion(0, 10));
    console.log(array.shuffle());
  });
});
