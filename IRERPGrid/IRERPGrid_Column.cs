using DotLiquid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRERP.Web.Controls
{
    [LiquidType("Name","Title","type","Width")]
    public class IRERPGrid_Column
    {
        public virtual string Name { get; set; }
        public virtual string Title { get; set; }
        public virtual string type { get; set; }
        public virtual string Width { get; set; }
    }
}
