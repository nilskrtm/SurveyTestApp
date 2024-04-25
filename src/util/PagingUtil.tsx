export default {
  calculatePaging(requestPagingOptions: any, count: number) {
    const offset: number = requestPagingOptions.perPage * (requestPagingOptions.page - 1);
    let lastPage: number = this.roundUp(count / requestPagingOptions.perPage, 0);
    const lastPageOffset: number = requestPagingOptions.perPage * (lastPage - 1);

    if (lastPage === 0) {
      lastPage = 1;
    }

    const paging: any = {
      perPage: requestPagingOptions.perPage,
      page: requestPagingOptions.page,
      lastPage: lastPage,
      offset: offset,
      count: count
    };

    if (count - offset < 1) {
      if (count !== 0) {
        paging.page = lastPage;
        paging.offset = lastPageOffset;
      } else {
        paging.page = 1;
        paging.offset = 0;
      }
    }

    return paging;
  },
  roundUp(number: number, decimals: number) {
    if (decimals === 0) {
      return Math.ceil(number);
    }

    const factor = 10 ** decimals;

    return Math.ceil(number * factor) / factor;
  }
};
