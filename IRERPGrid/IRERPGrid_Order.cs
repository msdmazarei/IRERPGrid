using MsdLib.CSharp.BLLCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRERP.Web.Controls
{
    public enum OrderType
    {
        Asc,
        Desc
    }

    public class IRERPGrid_Order
    {
        public virtual OrderType Ordertype { get; set; }
        public virtual string Columnname { get; set; }
        public OrderBy ToOrderBy()
        {
            OrderBy o = new OrderBy();
            o.SortType = Ordertype == OrderType.Asc ? SortType.Asc : SortType.Desc;
            o.PropertyName = Columnname;
            return o;
        }
    }
}
