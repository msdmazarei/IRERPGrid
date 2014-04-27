using DotLiquid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IRERP.Web.Controls;
using System.Collections;
using Irony.Parsing;
using MsdLib.CSharp.DALCore;
using IRERP_RestAPI.Bases.MetaDataDescriptors;
using System.Configuration;
using System.Web;
using System.IO;
using System.Web.SessionState;
using System.Reflection;
namespace TestIRERPGrid
{
    class Program
    {
        public static IList TestDataRepo()
            {
                List<Type> lst = new List<Type>();
                try
                {
                    AppDomain.CurrentDomain.GetAssemblies().ToList().ForEach(y => { lst.AddRange(y.GetTypes()); });
                }
                catch { }

                return lst;

            }
        public static void MakeHttpContext()
        {

            var httpRequest = new HttpRequest("", "http://mis.petiak.com/", "");
            var stringWriter = new StringWriter();
            var httpResponce = new HttpResponse(stringWriter);
            var httpContext = new HttpContext(httpRequest, httpResponce);

            var sessionContainer = new HttpSessionStateContainer("id", new SessionStateItemCollection(),
                                                                 new HttpStaticObjectsCollection(), 10, true,
                                                                 HttpCookieMode.AutoDetect,
                                                                 SessionStateMode.InProc, false);

            httpContext.Items["AspSession"] = typeof(HttpSessionState).GetConstructor(
                                                     BindingFlags.NonPublic | BindingFlags.Instance,
                                                     null, CallingConventions.Standard,
                                                     new[] { typeof(HttpSessionStateContainer) },
                                                     null)
                                                .Invoke(new object[] { sessionContainer });

            System.Web.HttpContext.Current = httpContext;
        }
        static void setupdb()
        {
            
            if (!(DBFactory.ConnectionString != null && DBFactory.ConnectionString.Trim() != ""))
                DBFactory.ConnectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ToString();


            List<string> MappingFiles = new List<string>();
            try
            {

                //Add Queries
                var queries = System.IO.Directory.GetFiles("Queries");

                if (queries != null)
                    queries.ToList().ForEach(x => MappingFiles.Add(x));
            }
            catch { }

            DBFactory.MappingsFile = MappingFiles.ToArray();
            //MetaModels 
            List<Type> lst = new List<Type>();
            AppDomain.CurrentDomain.GetAssemblies()
                .ToList().ForEach(

                x =>
                {
                    if (x.FullName.IndexOf("IRERP_RestAPI_Models") == 0)
                    {
                        x.GetTypes().ToList().ForEach(type =>
                        {
                            if (IRERP_RestAPI.Bases.IRERPApplicationUtilities.IsSubclassOfRawGeneric(
                                typeof(IRERPDescriptor<>), type)
                                )
                                if (!lst.Contains(type))
                                    lst.Add(type);
                        });
                    }
                });

            lst.Add(typeof(IRERP_RestAPI.Bases.NHComponents.IRERPFileMap));
            lst.Add(
                typeof(IRERP_RestAPI.Bases.NHComponents.IRERPGAddressMap));
              lst.ForEach(x => IRERP_RestAPI.Bases.IRERPApplicationUtilities.NewInstance(x));
            DBFactory.MappingTypes = lst.ToArray();
        }
        static void Main(string[] args)
        {
            MakeHttpContext();
            setupdb();

            var ses = MsdLib.CSharp.DALCore.DBFactory.Instance.NewSession(true);
            var l = IRERP_RestAPI.ModelRepositories.PetiakWifiPerforma_Repository.GetAllPerforma();

           
        }
    }
}
