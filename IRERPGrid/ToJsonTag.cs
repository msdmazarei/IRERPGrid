using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
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
            base.Render(context, result);
            Dictionary<string, object> keyvalue = General.GetDotLiquidVariables(context, Args);
            List<Dictionary<string, object>> rtn = new List<Dictionary<string, object>>();
            if (Args.Count == 1)
            {
                result.Write(General.ToSimpleJSON(keyvalue[Args[0]]));   
            }
            else if (Args.Count == 2)
            {
                dynamic DataArray = keyvalue[Args[0]];
                dynamic Cols = keyvalue[Args[1]];
                if (DataArray != null)
                {
                    List<string> ColumnNames = new List<string>();
                    if (Cols != null)
                    {
                        if (Cols.GetType() == typeof(List<IRERPGrid_Column>) ||
                            Cols.GetType() == typeof(IRERPGrid_Column[])
                            )
                        {
                            foreach (IRERPGrid_Column c in Cols)
                                ColumnNames.Add(c.Name);
                        }
                        else
                            if (Cols.GetType() == typeof(List<string>) ||
                                Cols.GetType() == typeof(string[])
                            )
                            {
                                ColumnNames.AddRange(Cols);
                            }

                        foreach (object a in DataArray)
                        {
                            Dictionary<string, object> item = new Dictionary<string, object>();
                            foreach (string colname in ColumnNames)
                            {
                                if (a != null)
                                {
                                    if (a.GetType() == typeof(System.Data.DataRow))
                                    {
                                        int ind = ((System.Data.DataRow)a).Table.Columns.IndexOf(colname);
                                        item.Add(colname, ((System.Data.DataRow)a).ItemArray[ind]);
                                    }else
                                    
                                    item.Add(colname, IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetProperty(a, colname));
                                }
                            }
                            rtn.Add(item);
                        }

                    }
                }
                string strrtn = General.ToSimpleJSON(rtn);

                result.Write(strrtn);
            }
        }
    }
}
