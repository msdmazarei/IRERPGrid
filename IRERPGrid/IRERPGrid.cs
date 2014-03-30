using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DotLiquid;
using Newtonsoft.Json;
namespace IRERP.Web.Controls
{

    [LiquidType("Name", "Columns", "Totalpages", "Pageindex")]

    public class IRERPGrid 
    {
        public static IList defaultGetDataList(IRERPGrid Grid)
        {
            if (Grid.DatasRepository != null && Grid.DatasRepository.IndexOf("()") > 0)
                return (IList)General.CallStaticMethod(Grid.DatasRepository);


            return null;
        }
        public IRERPGrid()
        {
            Orders = new List<IRERPGrid_Order>();
            Columns = new List<IRERPGrid_Column>();
            PageSize = 10;
            GetDataList = new GetDatas(IRERPGrid.defaultGetDataList);
        }
        public delegate IList GetDatas(IRERPGrid Grid);
        public virtual string Name { get; set; }
        public virtual string ViewName { get; set; }
        //Can Be Method like a.b.c() or can be property like a.v.c.d
        public virtual string DatasRepository { get; set; }
        public virtual List<IRERPGrid_Order> Orders { get; set; }
        [JsonIgnore]
        public virtual GetDatas GetDataList { get; set; }
        public virtual List<string> DataColumns { get; set; }
        public virtual int PageSize { get; set; }
        public virtual int Pageindex { get; set; }
        [JsonIgnore]
        public virtual int Totalpages
        {
            get
            {
                int totalitems = GetDataList(this).Count;
                int Div = totalitems / PageSize;
                if ((totalitems % PageSize) > 0) Div++;
                return Div;
            }
        }

        public virtual List<IRERPGrid_Column> Columns { get; set; }
        
        public virtual string GetGridForHtmlPage(string templatepath = null)
        {
            string rtn = "";
            if(DataColumns==null)
                if(Columns!=null && Columns.Count>0)
                {
                    DataColumns = new List<string>();
                    Columns.ForEach(x => DataColumns.Add(x.Name));
                }

            RegisterTags();

            string template = "";
            string BrowerName = "Templates\\FireFox";
            if (templatepath != null) BrowerName = templatepath + "\\" + BrowerName;
            if (System.IO.File.Exists(BrowerName + "\\Grid.tpl"))
            {
                Template.FileSystem = new IRERPGrid_DotLiquidFileSystem(BrowerName);
                //Html Section
                template = System.IO.File.ReadAllText(BrowerName + "\\Grid.tpl");
                Template TMP = Template.Parse(template);
                rtn = TMP.Render(Hash.FromAnonymousObject(new { Grid = this , GridData = GetDatasToView()}));
                
            }
            return rtn;
            

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
            int FromItem = PageSize * Pageindex;
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
