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
            PageSize = 10;
        }
        public delegate IList GetDatas(IRERPGrid Grid);
        public virtual string Name { get; set; }
        public virtual string ViewName { get; set; }
        //Can Be Method like a.b.c() or can be property like a.v.c.d
        public virtual string DatasRepository { get; set; }
        public virtual List<IRERPGrid_Order> Orders { get; set; }
        public virtual GetDatas GetDataList { get; set; }
        public virtual int PageSize { get; set; }
        public virtual int PageIndex { get; set; }

        public virtual List<IRERPGrid_Column> Columns { get; set; }
        public virtual string GetGridForHtmlPage()
        {
            RegisterTags();
            string template = "";
            string BrowerName = "Templates\\FireFox";
            if (System.IO.File.Exists(BrowerName + "\\Grid.tpl"))
            {
                template = System.IO.File.ReadAllText(BrowerName + "\\Grid.tpl");

                Template TMP = Template.Parse(template);



                return TMP.Render(Hash.FromAnonymousObject(new { Grid = this , GridData = GetDatasToView()}));
            }
            return "";
            

        }
        void RegisterTags()
        {
            Template.RegisterTag<GetGridRowColumnValue>("GGRCV");
        }
        #region internal Usage
        protected virtual IList GetDatasToView()
        {
            IList lst = null;
            IList RetuenLst = null;

            if (GetDataList != null)
                lst = GetDataList(this);

            if (lst == null)
                RetuenLst = new List<object>();

            if (lst.Count == 0) new List<object>();

            RetuenLst =(IList) Activator.CreateInstance(lst.GetType());
            int FromItem = PageSize * PageIndex;
            int ToItem = FromItem + PageSize;
            if (ToItem > lst.Count - 1) ToItem = lst.Count - 1;
            for (int i = FromItem; i <= ToItem; i++)
            {
                RetuenLst.Add(lst[i]);
            }


            return RetuenLst;
        }
        public static object GetColumnValue(object row, IRERPGrid_Column col)
        {
            object rtn = null;
            if (row != null)
            {
                rtn = row.GetType().GetProperty(col.Name).GetValue(row);
            }
            return rtn;
            
        }

        #endregion
     


        
    }
}
