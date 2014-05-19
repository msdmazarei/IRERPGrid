using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRERP.Web.Controls.Tags
{
    /// <summary>
    /// GGRCV Tag
    /// </summary>
    public class GetGridRowColumnValue : DotLiquid.Tag
    {
        string RowVariableName = null;
        string ColumnVariableName = null;
        public override void Initialize(string tagName, string markup, System.Collections.Generic.List<string> tokens)
        {
            base.Initialize(tagName, markup, tokens);
            RowVariableName = markup.Split(' ')[0].Trim();
            ColumnVariableName = markup.Split(' ')[1].Trim();
        }
        public override void Render(DotLiquid.Context context, System.IO.TextWriter result)
        {
            object RowObj =
                  (from x in context.Scopes
                   where x.Keys.Contains(RowVariableName)
                   select x[RowVariableName]).FirstOrDefault();
            if (RowObj == null)
                RowObj = (from env in context.Environments
                          where env.Keys.Contains(RowVariableName)
                          select env[RowVariableName]).FirstOrDefault();
            IRERPGrid_Column colobj =
                (IRERPGrid_Column)
                  (from x in context.Scopes
                   where x.Keys.Contains(ColumnVariableName)
                   select x[ColumnVariableName]).FirstOrDefault();
            result.Write(IRERPGrid.GetColumnValue(RowObj, colobj).ToString());
            base.Render(context, result);
        }
    }
}
