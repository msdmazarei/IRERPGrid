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

    [LiquidType("Name", "Columns", "Totalpages", "Pageindex","Pagesize", "Totalitems", "Divcontainerid",
        "Tabledataid"
        )]

    public class IRERPGrid 
    {
        public static IList defaultGetDataList(IRERPGrid Grid)
        {
            if (Grid.DatasRepository != null && Grid.DatasRepository.IndexOf("()") > 0)
                return (IList)General.CallStaticMethod(Grid.DatasRepository);


            return null;
        }
        public class IRERPGridRendered
        {
            public string HTML { get; set; }
            public string JavaScript { get; set; }
            public string ToHtml()
            {
                string rtn = "";
                if (HTML != null) rtn += HTML;
                if (JavaScript != null) 
                    rtn += "<script>"+JavaScript+"</script>";
                return rtn;
            }
        }
        public IRERPGrid()
        {
            Orders = new List<IRERPGrid_Order>();
            Columns = new List<IRERPGrid_Column>();
            Pagesize = 10;
            GetDataList = new GetDatas(IRERPGrid.defaultGetDataList);
        }
        public delegate IList GetDatas(IRERPGrid Grid);
        public virtual string Name { get; set; }
        public virtual string ViewName { get; set; }
        //Can Be Method like a.b.c() or can be property like a.v.c.d
        public virtual string DatasRepository { get; set; }
        public virtual List<IRERPGrid_Order> Orders { get; set; }
        public virtual List<MsdLib.CSharp.BLLCore.MsdCriteria> Criterias { get; set; }
        [JsonIgnore]
        public virtual GetDatas GetDataList { get; set; }
        public virtual List<string> DataColumns { get; set; }
        public virtual int Pagesize { get; set; }
        public virtual int Pageindex { get; set; }
        public virtual int Totalitems
        {
            get
            {
               return GetDataList(this).Count;
            }
        }
        [JsonIgnore]
        public virtual int Totalpages
        {
            get
            {
                int totalitems = GetDataList(this).Count;
                int Div = totalitems / Pagesize;
                if ((totalitems % Pagesize) > 0) Div++;
                return Div;
            }
        }

        public virtual List<IRERPGrid_Column> Columns { get; set; }

        protected virtual void FillHtmlTemplateProperties()
        {
            string uniqpart = Guid.NewGuid().ToString().Replace("-", "");
            if (!(Divcontainerid != null && Divcontainerid.Trim() != ""))
                Divcontainerid = "Container-" + Name + "-" + uniqpart;
            if (!(Tabledataid != null && Tabledataid.Trim() != ""))
                Tabledataid = "TableData-" + Name + "-" + uniqpart;

        }
        public virtual IRERPGridRendered GetGridForHtmlPage(string templatepath = null)
        {
            return RenderTemplate("FullHtmlRender\\Grid.tpl", "FullHtmlRender\\Grid.js.tpl", GetDatasToView(), templatepath);
       

        }
        void RegisterTags()
        {
            Template.RegisterTag<GetGridRowColumnValue>("GGRCV");
            Template.RegisterTag<ToJsonTag>("ToJson");
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
            int FromItem = Pagesize * Pageindex;
            int ToItem = FromItem + Pagesize;
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

        #region Template Usage
        public virtual string Divcontainerid
        {
            get;
            set;
        }
        public virtual string Tabledataid
        {
            get;
            set;
        }
        #endregion
        public virtual IRERPGridRendered RenderTemplate(
            
            string GridHtmlTemplateName, string JavaScriptTemplaeName, IList inpGridData,string templatepath = null
            )
        {
            FillHtmlTemplateProperties();

            IRERPGridRendered rtn = new IRERPGridRendered();
            if (DataColumns == null)
                if (Columns != null && Columns.Count > 0)
                {
                    DataColumns = new List<string>();
                    Columns.ForEach(x => DataColumns.Add(x.Name));
                }

            RegisterTags();
            if (GridHtmlTemplateName.IndexOf('\\') != 0)
                GridHtmlTemplateName = "\\" + GridHtmlTemplateName;
            if (JavaScriptTemplaeName.IndexOf('\\') != 0)
                JavaScriptTemplaeName = "\\" + JavaScriptTemplaeName;


            string template = "";
            string BrowerName = "Templates\\FireFox";
            if (templatepath != null) BrowerName = templatepath + "\\" + BrowerName;
            if (System.IO.File.Exists(BrowerName + GridHtmlTemplateName))
            {
                Template.FileSystem = new IRERPGrid_DotLiquidFileSystem(BrowerName);
                //Html Section
                template = System.IO.File.ReadAllText(BrowerName + GridHtmlTemplateName);
                Template TMP = Template.Parse(template);
                rtn.HTML = TMP.Render(Hash.FromAnonymousObject(new { Grid = this, GridData = inpGridData }));
                //POJOs
                template = System.IO.File.ReadAllText(BrowerName + JavaScriptTemplaeName);
                TMP = Template.Parse(template);
                rtn.JavaScript = TMP.Render(Hash.FromAnonymousObject(new { Grid = this, GridData = GetDatasToView() }));

            }
            return rtn;
     
        }
        public virtual IRERPGridRendered Fetch(
            int From, 
            int Count, 
            List<IRERPGrid_Order> sorts, 
            List<MsdLib.CSharp.BLLCore.MsdCriteria> crits,
            string templatepath = null
            )
        {
            IRERPGridRendered rtn = new IRERPGridRendered();
            this.Orders = sorts;
            this.Criterias = crits;

            if (From < 0)
            {
                rtn.JavaScript = "{ErrorCode:-10,ErrorMessage:'From is less than 0, From valid values are 0 or greater than 0'}";
                return rtn;
            }
            if (Count < 0)
            {
                rtn.JavaScript = "{ErrorCode:-11,ErrorMessage:'Count is less than 0, Count valid values are 1 or greater'}";
                return rtn;
            }
            try
            {
                IList datas = GetDataList(this);
                if (From > datas.Count - 1)
                {
                    rtn.JavaScript = "{ErrorCode:-12,ErrorMessage:'From is greater than Repository datas count.'}";
                    return rtn;
                }
                if (From + Count > datas.Count)
                {
                    rtn.JavaScript = "{ErrorCode:-13,ErrorMessage:'From + Count is greater than Repository datas count'}";
                    return rtn;
                }


                IList RetuenLst = (IList)Activator.CreateInstance(datas.GetType());
                for (int i = From; i < From+Count; i++)
                    RetuenLst.Add(datas[i]);

                //Render Templates
                return
                    RenderTemplate("Fetch\\Grid.tpl", "Fetch\\Grid.js.tpl", RetuenLst, templatepath);

                
            }
            catch (Exception ex)
            {
                rtn.JavaScript = "{ErrorCode=-1,ErrorMessage:'"+ex.Message+"'}";
                return rtn;
            }
            
            return rtn;
        }
    }
}
