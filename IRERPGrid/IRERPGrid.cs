using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DotLiquid;
namespace IRERP.Web.Controls
{

    [LiquidType("Name", "Columns")]
    public class IRERPGrid 
    {
        public IRERPGrid()
        {
            Orders = new List<IRERPGrid_Order>();
            Columns = new List<IRERPGrid_Column>();
        }
        public delegate IList GetDatas(IRERPGrid Grid);
        public virtual string Name { get; set; }
        public virtual string ViewName { get; set; }
        //Can Be Method like a.b.c() or can be property like a.v.c.d
        public virtual string DatasRepository { get; set; }
        public virtual List<IRERPGrid_Order> Orders { get; set; }
        public virtual GetDatas GetDataList { get; set; }
        public virtual List<IRERPGrid_Column> Columns { get; set; }
        public virtual string GetGridForHtmlPage()
        {
            string template = "";
            string BrowerName = "Templates\\FireFox";
            if (System.IO.File.Exists(BrowerName + "\\Grid.tpl"))
            {
                template = System.IO.File.ReadAllText(BrowerName + "\\Grid.tpl");
                Template TMP = Template.Parse(template);
                return TMP.Render(Hash.FromAnonymousObject(new { Grid = this }));
            }
            return "";
            

        }


        
    }
}
