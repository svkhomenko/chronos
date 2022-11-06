// import { buildExternalHelpers } from '@babel/core';
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//     page: 1,
//     orderBy: 'like',
//     activeChecked: true,
//     inactiveChecked: false,
//     search: '',
//     categories: [],
//     dateFrom: '',
//     dateTo: '',
//     reset: false
// }

// export const searchParametersSlice = createSlice({
//     name: 'searchParameters',
//     initialState,
//     reducers: {
//         setPage: (state, action) => {
//             state.page = action.payload.page;
//         },
//         resetPage: (state) => {
//             state.page = 1;
//         },
//         setOrderBy: (state, action) => {
//             state.orderBy = action.payload.orderBy;
//         },
//         toggleActive: (state) => {
//             state.activeChecked = !state.activeChecked;
//         },
//         toggleInactive: (state) => {
//             state.inactiveChecked = !state.inactiveChecked;
//         },
//         setSearch: (state, action) => {
//             state.search = action.payload.search;
//         },
//         setCategories: (state, action) => {
//             state.categories = action.payload.categories;
//             state.reset = false;
//         },
//         setDateFrom: (state, action) => {
//             state.dateFrom = action.payload.dateFrom;
//         },
//         setDateTo: (state, action) => {
//             state.dateTo = action.payload.dateTo;
//         },
//         setReset: (state, action) => {
//             state.reset = action.payload.reset;
//         },
//         removeSearchParameters(state) {
//             state.page = 1;
//             state.orderBy = 'like';
//             state.activeChecked = true;
//             state.inactiveChecked = false;
//             state.search = '';
//             state.categories = [];
//             state.dateFrom = '';
//             state.dateTo = '';
//             state.reset = true;
//         }
//     }
// });

// export const { setPage, resetPage, setOrderBy, toggleActive, toggleInactive, setSearch, setCategories, setDateFrom, setDateTo, setReset, removeSearchParameters } = searchParametersSlice.actions;
// export default searchParametersSlice.reducer;

