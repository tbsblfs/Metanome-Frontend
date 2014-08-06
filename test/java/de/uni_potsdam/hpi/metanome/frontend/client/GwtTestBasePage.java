/*
 * Copyright 2014 by the Metanome project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package de.uni_potsdam.hpi.metanome.frontend.client;

import com.google.gwt.core.client.GWT;
import com.google.gwt.junit.client.GWTTestCase;
import com.google.gwt.user.client.rpc.AsyncCallback;
import com.google.gwt.user.client.ui.ScrollPanel;
import com.google.gwt.user.client.ui.Widget;

import de.uni_potsdam.hpi.metanome.algorithm_integration.AlgorithmConfigurationException;
import de.uni_potsdam.hpi.metanome.algorithm_integration.configuration.ConfigurationSettingCsvFile;
import de.uni_potsdam.hpi.metanome.frontend.client.BasePage.Tabs;
import de.uni_potsdam.hpi.metanome.frontend.client.algorithms.AlgorithmsPage;
import de.uni_potsdam.hpi.metanome.frontend.client.datasources.DataSourcePage;
import de.uni_potsdam.hpi.metanome.frontend.client.results.ResultsPage;
import de.uni_potsdam.hpi.metanome.frontend.client.runs.RunConfigurationPage;
import de.uni_potsdam.hpi.metanome.frontend.client.services.AlgorithmService;
import de.uni_potsdam.hpi.metanome.frontend.client.services.AlgorithmServiceAsync;
import de.uni_potsdam.hpi.metanome.results_db.Algorithm;

import org.junit.Test;

import java.util.LinkedList;
import java.util.List;

/**
 * Tests related to the overall page.
 */
public class GwtTestBasePage extends GWTTestCase {

  LinkedList<Algorithm> algorithms = new LinkedList<>();
  /**
   * this must contain an algorithm and a data source that are currently available
   */
  private String dataSourceName = "inputA.csv";

  /**
   * Test method for {@link BasePage#BasePage()}
   */
  @Test
  public void testNewBasePage() {
    // Execute
    BasePage testPage = new BasePage();

    // Check
    assertEquals(5, testPage.getWidgetCount());

    Widget wrapper = testPage.getWidget(Tabs.RESULTS.ordinal());
    assertTrue(wrapper instanceof TabWrapper);
    assertTrue(((TabWrapper) wrapper).contentPanel instanceof ResultsPage);

    Widget panel =  testPage.getWidget(Tabs.ALGORITHMS.ordinal());
    assertTrue(panel instanceof ScrollPanel);
    wrapper = ((ScrollPanel) panel).getWidget();
    assertTrue(wrapper instanceof TabWrapper);
    assertTrue(((TabWrapper) wrapper).contentPanel instanceof AlgorithmsPage);

    panel =  testPage.getWidget(Tabs.DATA_SOURCES.ordinal());
    assertTrue(panel instanceof ScrollPanel);
    wrapper = ((ScrollPanel) panel).getWidget();
    assertTrue(wrapper instanceof TabWrapper);
    assertTrue(((TabWrapper) wrapper).contentPanel instanceof DataSourcePage);

    panel =  testPage.getWidget(Tabs.RUN_CONFIGURATION.ordinal());
    assertTrue(panel instanceof ScrollPanel);
    wrapper = ((ScrollPanel) panel).getWidget();
    assertTrue(wrapper instanceof TabWrapper);
    assertTrue(((TabWrapper) wrapper).contentPanel instanceof RunConfigurationPage);

  }

  public void testAddAlgorithmsToRunConfigurations() {
    BasePage page = new BasePage();
    int itemCount = page.runConfigurationsPage.getJarChooser().getListItemCount();
    algorithms.add(new Algorithm("Algorithm 1"));
    algorithms.add(new Algorithm("Algorithm 2"));

    // Execute
    page.addAlgorithmsToRunConfigurations(algorithms);

    // Check
    assertEquals(itemCount + 2, page.runConfigurationsPage.getJarChooser().getListItemCount());
  }

  /**
   * Test control flow from Algorithms to Run configuration
   */
  public void testJumpToRunConfigurationFromAlgorithm() {
    // Setup
    final String algorithmName = "some_name";
    final BasePage page = new BasePage();
    Algorithm a = new Algorithm("file/name").setAuthor("author").setName(algorithmName);
    algorithms.add(a);

    page.addAlgorithmsToRunConfigurations(algorithms);

    AsyncCallback<List<Algorithm>> callback = new AsyncCallback<List<Algorithm>>() {
      @Override
      public void onFailure(Throwable caught) {
        caught.printStackTrace();
        fail();
      }

      @Override
      public void onSuccess(List<Algorithm> result) {
        page.addAlgorithmsToRunConfigurations(result);

        // Execute
        page.switchToRunConfiguration(algorithmName, null);

        // Check
        assertEquals(Tabs.RUN_CONFIGURATION.ordinal(), page.getSelectedIndex());
        assertEquals(algorithmName, getRunConfigurationPage(page).getCurrentlySelectedAlgorithm());

        // TODO Add testing to ensure the parameter table is shown
        // assertEquals(2, (((AlgorithmTab)
        // page.getWidget(page.getSelectedIndex()))).getWidgetCount());
        // assertTrue((((AlgorithmTab) page.getWidget(page.getSelectedIndex()))).getWidget(1)
        // instanceof ParameterTable);

        finishTest();
      }
    };

    ((AlgorithmServiceAsync) GWT.create(AlgorithmService.class)).listAllAlgorithms(callback);

    delayTestFinish(5000);
  }

  /**
   * Test control flow from Data source to Run configuration
   */
  public void testJumpToRunConfigurationFromDataSource() throws AlgorithmConfigurationException {
    final BasePage page = new BasePage();
    ConfigurationSettingCsvFile dataSource = new ConfigurationSettingCsvFile();
    dataSource.setFileName(dataSourceName);
    final ConfigurationSettingCsvFile finalDataSource = dataSource;

    AsyncCallback<List<Algorithm>> callback = new AsyncCallback<List<Algorithm>>() {
      @Override
      public void onFailure(Throwable caught) {
        caught.printStackTrace();
      }

      @Override
      public void onSuccess(List<Algorithm> result) {
        page.addAlgorithmsToRunConfigurations(result);

        // Execute
        page.switchToRunConfiguration(null, finalDataSource);

        RunConfigurationPage runConfigPage = getRunConfigurationPage(page);

        // Check
        assertEquals(Tabs.RUN_CONFIGURATION.ordinal(), page.getSelectedIndex());
        assertEquals(finalDataSource.getValueAsString(),
            runConfigPage.primaryDataSource.getValueAsString());
        // TODO assert correct filtering

        finishTest();
      }
    };

    ((AlgorithmServiceAsync) GWT.create(AlgorithmService.class)).listAllAlgorithms(callback);

    delayTestFinish(5000);
  }

  private RunConfigurationPage getRunConfigurationPage(final BasePage page) {
    return (RunConfigurationPage) ((TabWrapper) ((ScrollPanel) page.getWidget(page.getSelectedIndex())).getWidget()).contentPanel;
  }

  @Override
  public String getModuleName() {
    return "de.uni_potsdam.hpi.metanome.frontend.MetanomeTest";
  }

}
