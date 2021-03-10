const paidStatus = (array: any) => { 
  const paidTotal = array?.reduce((a:any, b:any) => a+(b.d_clients_application_pay.reduce((a:any, b:any) => a + Number(b.sum_pay || 0), 0) || 0), 0);
  const payTotal = array?.reduce((a:any, b:any) => a+b.d_clients_application_products.reduce((a:any, b:any) => a + Number(b.total || 0), 0), 0);
  const applicantDebt = array.map((item: any) => { 
    const a = item?.d_clients_application_pay?.reduce((a:any, b:any) => a+(b.sum_pay || 0), 0);
    const b = item?.d_clients_application_products?.reduce((a:any, b:any) => a+b.total, 0);
    if(a - b <= 0) return;
    else return {
      number: item.application_number,
      total: Number(a - b)
    };
  }).filter((item: any) => item ? true : false );
  if(payTotal - paidTotal <= 0) return 0;
  else return {
    detailing: applicantDebt,
    count: Number(payTotal - paidTotal).toFixed(2)
  };
}

export default paidStatus