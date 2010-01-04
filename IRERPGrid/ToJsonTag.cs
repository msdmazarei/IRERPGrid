using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRERP.Web.Controls
{
    public class ToJsonTag : DotLiquid.Tag
    {
        List<string> Args = new List<string>();
        public override void Initialize(string tagName, string markup, List<string> tokens)
        {
            base.Initialize(tagName, markup, tokens);
            string[] args = markup.Split(' ');
            if (args != null)
                args.ToList().ForEach(x =>
                    {
                        if (x != null && x.Trim() != "")
                            Args.Add(x);
                    });

        }
        public override void Render(DotLiquid.Context context, System.IO.TextWriter result)
        {
            Dictionary<string, object> keyvalue = General.GetDotLiquidVariables(context, Args);
            var DataArray = keyvalue[Args[0]];
            var Cols = keyvalue[Args[1]];
            if (DataArray != null)
            {
                if (Cols != null)
                {
                    if (Cols.GetType() == typeof(List<IRERPGrid_Column>) ||
                        Cols.GetType()== typeof(IRERPGrid_Column[])
                        )
                    {
                    }
                    else 
                        if (Cols.GetType() == typeof(List<string>) ||
                            Cols.GetType()== typeof(string[])
                        )
                    {
                    }
                    
                   
                }
            }
            base.Render(context, result);
        }
    }
}
