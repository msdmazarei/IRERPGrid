using DotLiquid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRERP.Web.Controls
{
    [LiquidType("Name","Title")]
    public class IRERPGrid_Column
    {
        public virtual string Name { get; set; }
        public virtual string Title { get; set; }
    }
}
