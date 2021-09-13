export const PublicFilter = (filterData, filterSave, getAllData, selectList, fieldValue) => {
  let index;
  let filterObj;
  let children;
  let dimensionArrLength = 0;
  let selectDimLength = 0;
  let newFieldValue = { keys: [] };
  for (let i in filterSave) {
    if (filterSave[i].parent[0].indexOf('机构') >= 0) {
      children = filterSave[i].children;
      index = i;
    }
  }
  if (index) {
    filterSave.splice(index, 1);
    filterObj = filterData[filterData.length - 1];
    getAllData = filterObj;
    selectList = [getAllData[0].val];
    filterData.splice(index, 1);
    filterData = filterData.map(item => {
      if (!!item) return item;
    })
    filterSave = filterSave.map(item => {
      if (!!item) return item;
    })
    for (let i in fieldValue) {
      if (i.indexOf('dimensionArr') >= 0 && JSON.stringify(fieldValue[i]) === JSON.stringify(children)) delete fieldValue[i];
      if (i.indexOf('selectDim') >= 0 && fieldValue[i][0].indexOf('机构') >= 0) delete fieldValue[i];
    }
    for (let i in fieldValue) {
      if (i.indexOf('dimensionArr') >= 0) {
        newFieldValue['dimensionArr' + dimensionArrLength] = fieldValue[i];
        dimensionArrLength += 1;
      }
      if (i.indexOf('selectDim') >= 0) {
        newFieldValue['selectDim' + selectDimLength] = fieldValue[i];
        selectDimLength += 1;
      }
    }
    if (selectDimLength === 0) selectDimLength += 1;    // 如果为0，则需要添加一个值，否则数组就是空
    for (let i = 0; i < selectDimLength; i++) {
      newFieldValue.keys.push(i);
    }
    fieldValue = newFieldValue;
    return { filterData, filterSave, getAllData, selectList, fieldValue }
  } else return null;
}