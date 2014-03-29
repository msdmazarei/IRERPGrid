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
        public virtual OrderType OrderType { get; set; }
        public virtual string ColumnName { get; set; }
    }
}
