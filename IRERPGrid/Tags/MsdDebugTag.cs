using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
namespace IRERP.Web.Controls.Tags
{
    public class MsdDebugTag : DotLiquid.Tag
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
            base.Render(context, result);
            Dictionary<string, object> keyvalue = General.GetDotLiquidVariables(context, Args);
            List<Dictionary<string, object>> rtn = new List<Dictionary<string, object>>();
            result.Write(keyvalue.ToString());
            }
        }
    }

