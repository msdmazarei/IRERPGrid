using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRERP.Web.Controls
{
    public class General
    {
        [ThreadStatic]
        static DotLiquid.Context _context = null;
        
        public static DotLiquid.Context IRERPGrid_DotLiquidContext
        {
            get
            {
                if (_context == null) _context = new DotLiquid.Context();
                return _context;
            }
        }
    }
}
